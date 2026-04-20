import AppModal from "@/components/app-components/app-modal/AppModal"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
import AppContent from "@/components/app-layout/app-content/AppContent"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { BengkelService } from "@/helpers/services/BengkelService"
import { IMsBengkel } from "@/interfaces/Bengkel.interface"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { DialogMode } from "./constant"

const ManageBengkelPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [bengkelList, setBengkelList] = useState<IMsBengkel[]>([])

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<DialogMode>("add")
    const [selectedBengkel, setSelectedBengkel] = useState<IMsBengkel | null>(null)
    const [bengkelName, setBengkelName] = useState("")
    const [nameError, setNameError] = useState("")

    const [isShowError, setIsShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [isShowSuccess, setIsShowSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [sortBy, setSortBy] = useState<keyof IMsBengkel | undefined>()
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    const fetchData = async () => {
        const res = await BengkelService.getMasterBengkelList(setIsLoading)
        if (res.error) {
            setIsShowError(true)
            setErrorMessage(res.error || "Failed to fetch bengkel list.")
        } else {
            setBengkelList(res.data ?? [])
        }
    }

    const openAdd = () => {
        setSelectedBengkel(null)
        setBengkelName("")
        setNameError("")
        setDialogMode("add")
        setIsDialogOpen(true)
    }

    const openView = (bengkel: IMsBengkel) => {
        setSelectedBengkel(bengkel)
        setBengkelName(bengkel.bengkelName)
        setNameError("")
        setDialogMode("view")
        setIsDialogOpen(true)
    }

    const openEdit = (bengkel: IMsBengkel) => {
        setSelectedBengkel(bengkel)
        setBengkelName(bengkel.bengkelName)
        setNameError("")
        setDialogMode("edit")
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setSelectedBengkel(null)
        setBengkelName("")
        setNameError("")
    }

    const validate = () => {
        if (!bengkelName.trim()) {
            setNameError("Bengkel name is required")
            return false
        }
        setNameError("")
        return true
    }

    const handleSave = async () => {
        if (!validate()) return

        if (dialogMode === "add") {
            const result = await BengkelService.addMasterBengkel(
                { bengkelName: bengkelName.trim() },
                setIsLoading
            )
            if (result.error) {
                setIsShowError(true)
                setErrorMessage(result.error || "Failed to add bengkel.")
                return
            }
            setSuccessMessage("Bengkel added successfully")
        } else if (dialogMode === "edit" && selectedBengkel) {
            const result = await BengkelService.updateMasterBengkel(
                { bengkelId: selectedBengkel.bengkelId, bengkelName: bengkelName.trim() },
                setIsLoading
            )
            if (result.error) {
                setIsShowError(true)
                setErrorMessage(result.error || "Failed to update bengkel.")
                return
            }
            setSuccessMessage("Bengkel updated successfully")
        }

        setIsDialogOpen(false)
        setSelectedBengkel(null)
        setIsShowSuccess(true)
        fetchData()
    }

    const isViewMode = dialogMode === "view"

    const handleSearch = () => {
        setPage(1)
        setSearchQuery(searchInput.trim().toLowerCase())
    }

    const handleSort = (column: keyof IMsBengkel) => {
        if (sortBy === column) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            return
        }

        setSortBy(column)
        setSortOrder("asc")
    }

    const filteredAndSortedBengkels = useMemo(() => {
        const filteredRows = searchQuery
            ? bengkelList.filter((item) =>
                item.bengkelName.toLowerCase().includes(searchQuery)
            )
            : bengkelList

        if (!sortBy) {
            return filteredRows
        }

        return [...filteredRows].sort((left, right) => {
            const leftValue = left[sortBy]
            const rightValue = right[sortBy]

            if (leftValue == null && rightValue == null) {
                return 0
            }
            if (leftValue == null) {
                return sortOrder === "asc" ? -1 : 1
            }
            if (rightValue == null) {
                return sortOrder === "asc" ? 1 : -1
            }

            if (typeof leftValue === "number" && typeof rightValue === "number") {
                return sortOrder === "asc" ? leftValue - rightValue : rightValue - leftValue
            }

            const leftString = String(leftValue).toLowerCase()
            const rightString = String(rightValue).toLowerCase()

            if (leftString < rightString) {
                return sortOrder === "asc" ? -1 : 1
            }
            if (leftString > rightString) {
                return sortOrder === "asc" ? 1 : -1
            }

            return 0
        })
    }, [bengkelList, searchQuery, sortBy, sortOrder])

    const paginatedBengkelList = useMemo(() => {
        const start = (page - 1) * pageSize
        const end = start + pageSize
        return filteredAndSortedBengkels.slice(start, end)
    }, [filteredAndSortedBengkels, page, pageSize])

    const hasNextPage = page * pageSize < filteredAndSortedBengkels.length

    const columns: ColumnDef<IMsBengkel>[] = [
        {
            id: "no",
            header: "No",
            cell: ({ row }) => <p className="pl-2">{(page - 1) * pageSize + row.index + 1}</p>,
        },
        {
            accessorKey: "bengkelName",
            header: () => (
                <Button
                    variant="ghost"
                    className="px-0"
                    onClick={() => handleSort("bengkelName")}
                >
                    Bengkel Name
                    {sortBy === "bengkelName" ? (
                        sortOrder === "asc" ? (
                            <ArrowUp className="ml-1" />
                        ) : (
                            <ArrowDown className="ml-1" />
                        )
                    ) : (
                        <ArrowUpDown className="ml-1" />
                    )}
                </Button>
            ),
            cell: ({ row }) => (
                <p className="max-w-xs truncate" title={row.original.bengkelName}>
                    {row.original.bengkelName}
                </p>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const bengkel = row.original
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            title="View"
                            onClick={() => openView(bengkel)}
                        >
                            <Eye className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            title="Edit"
                            onClick={() => openEdit(bengkel)}
                        >
                            <Pencil className="size-4" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: paginatedBengkelList,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <AppContent>
            <div className="mb-4">
                <h1 className="scroll-m-20 mb-2 text-4xl font-extrabold tracking-tight text-balance">
                    Manage Bengkel
                </h1>
                <p className="text-muted-foreground">Ini page buat tambahin nama bengkel</p>
            </div>
            <div className="mb-4">
                <Button onClick={openAdd}>Add New</Button>
            </div>
            <div className="space-y-4">
                <Field orientation="horizontal" className="flex items-center gap-2">
                    <Input
                        type="search"
                        placeholder="Search by bengkel name"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                handleSearch()
                            }
                        }}
                    />
                    <Button onClick={handleSearch}>Search</Button>
                </Field>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No bengkel found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Page {page} • {paginatedBengkelList.length} row(s)
                    </p>

                    <div className="flex items-center gap-2">
                        <Label htmlFor="page-size-bengkel">Rows</Label>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(value) => {
                                setPage(1)
                                setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger id="page-size-bengkel" className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={!hasNextPage}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Add / View / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    className="sm:max-w-md"
                    onInteractOutside={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>
                            {isViewMode
                                ? "Bengkel Detail"
                                : dialogMode === "edit"
                                    ? "Edit Bengkel"
                                    : "Add New Bengkel"}
                        </DialogTitle>
                        <DialogDescription>
                            {isViewMode
                                ? "Review bengkel information."
                                : dialogMode === "edit"
                                    ? "Update the bengkel name and save."
                                    : "Enter a name for the new bengkel."}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field data-invalid={!isViewMode && !!nameError}>
                            <FieldLabel htmlFor="bengkel-name">Bengkel Name</FieldLabel>
                            <Input
                                id="bengkel-name"
                                value={bengkelName}
                                readOnly={isViewMode}
                                onChange={(e) => {
                                    setBengkelName(e.target.value)
                                    setNameError("")
                                }}
                                placeholder="Enter bengkel name"
                            />
                            {!isViewMode && nameError && (
                                <FieldError errors={[{ message: nameError }]} />
                            )}
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                {isViewMode ? "Close" : "Cancel"}
                            </Button>
                        </DialogClose>
                        {!isViewMode && (
                            <Button onClick={handleSave}>Save changes</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AppModal
                open={isShowError}
                title="Error"
                description={errorMessage}
                onClose={() => { setIsShowError(false); setErrorMessage("") }}
                onSubmit={() => { setIsShowError(false); setErrorMessage("") }}
            />
            <AppModal
                open={isShowSuccess}
                title="Success"
                description={successMessage}
                onClose={() => { setIsShowSuccess(false); setSuccessMessage("") }}
                onSubmit={() => { setIsShowSuccess(false); setSuccessMessage("") }}
            />

            {isLoading && <AppSpinner />}
        </AppContent>
    )
}

export default ManageBengkelPage
