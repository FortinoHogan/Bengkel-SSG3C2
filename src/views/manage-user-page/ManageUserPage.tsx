import AppContent from "@/components/app-layout/app-content/AppContent"
import AppModal from "@/components/app-components/app-modal/AppModal"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
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
import { Switch } from "@/components/ui/switch"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { UserService } from "@/helpers/services/UserService"
import { IAuthenticatedUser } from "@/interfaces/User.interface"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const ManageUserPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [users, setUsers] = useState<IAuthenticatedUser[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<IAuthenticatedUser | null>(null)
    const [email, setEmail] = useState("")
    const [isAdmin, setIsAdmin] = useState(false)
    const [emailError, setEmailError] = useState("")
    const [isShowError, setIsShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [isShowSuccess, setIsShowSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [sortBy, setSortBy] = useState<keyof IAuthenticatedUser | undefined>()
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    const fetchData = async () => {
        const result = await UserService.getAuthenticatedUserList(setIsLoading)
        if (result.error) {
            setIsShowError(true)
            setErrorMessage(result.error || "Failed to fetch authenticated users.")
            return
        }

        setUsers(result.data ?? [])
    }

    const resetForm = () => {
        setEmail("")
        setIsAdmin(false)
        setEmailError("")
    }

    const openAdd = () => {
        resetForm()
        setIsDialogOpen(true)
    }

    const closeAdd = () => {
        setIsDialogOpen(false)
        resetForm()
    }

    const openEditRole = (user: IAuthenticatedUser) => {
        setSelectedUser(user)
        setIsAdmin(Boolean(user.isAdmin))
        setIsEditDialogOpen(true)
    }

    const closeEditRole = () => {
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        setIsAdmin(false)
    }

    const validateEmail = () => {
        const trimmedEmail = email.trim().toLowerCase()

        if (!trimmedEmail) {
            setEmailError("Email is required")
            return null
        }

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
        if (!isValidEmail) {
            setEmailError("Email format is invalid")
            return null
        }

        setEmailError("")
        return trimmedEmail
    }

    const handleAddUser = async () => {
        const trimmedEmail = validateEmail()
        if (!trimmedEmail) {
            return
        }

        const addResult = await UserService.addAuthenticatedUser(
            {
                email: trimmedEmail,
                isAdmin,
            },
            setIsLoading
        )

        if (addResult.error) {
            setIsShowError(true)
            setErrorMessage(addResult.error || "Failed to add authenticated user.")
            return
        }

        setIsShowSuccess(true)
        setSuccessMessage("User added successfully")
        closeAdd()
        fetchData()
    }

    const handleUpdateRole = async () => {
        if (!selectedUser) {
            return
        }

        const result = await UserService.updateAuthenticatedUserRole(
            {
                authenticatedUserId: selectedUser.authenticatedUserId,
                isAdmin,
            },
            setIsLoading
        )

        if (result.error) {
            setIsShowError(true)
            setErrorMessage(result.error || "Failed to update user role.")
            return
        }

        setIsShowSuccess(true)
        setSuccessMessage("User role updated successfully")
        closeEditRole()
        fetchData()
    }

    const formatDate = (dateValue?: string) => {
        if (!dateValue) {
            return "-"
        }

        const parsedDate = new Date(dateValue)
        if (Number.isNaN(parsedDate.getTime())) {
            return "-"
        }

        return parsedDate.toLocaleString()
    }

    const handleSearch = () => {
        setPage(1)
        setSearchQuery(searchInput.trim().toLowerCase())
    }

    const handleSort = (column: keyof IAuthenticatedUser) => {
        if (sortBy === column) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            return
        }

        setSortBy(column)
        setSortOrder("asc")
    }

    const filteredAndSortedUsers = useMemo(() => {
        const filteredRows = searchQuery
            ? users.filter((user) => user.email.toLowerCase().includes(searchQuery))
            : users

        if (!sortBy) {
            return filteredRows
        }

        const sortedRows = [...filteredRows].sort((left, right) => {
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

            if (typeof leftValue === "boolean" && typeof rightValue === "boolean") {
                const leftNum = Number(leftValue)
                const rightNum = Number(rightValue)
                return sortOrder === "asc" ? leftNum - rightNum : rightNum - leftNum
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

        return sortedRows
    }, [users, searchQuery, sortBy, sortOrder])

    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * pageSize
        const end = start + pageSize
        return filteredAndSortedUsers.slice(start, end)
    }, [filteredAndSortedUsers, page, pageSize])

    const hasNextPage = page * pageSize < filteredAndSortedUsers.length

    const columns: ColumnDef<IAuthenticatedUser>[] = [
        {
            id: "no",
            header: "No",
            cell: ({ row }) => <p className="pl-2">{(page - 1) * pageSize + row.index + 1}</p>,
        },
        {
            accessorKey: "email",
            header: () => (
                <Button variant="ghost" className="px-0" onClick={() => handleSort("email")}>
                    Email
                    {sortBy === "email" ? (
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
                <p className="max-w-sm truncate" title={row.original.email}>
                    {row.original.email}
                </p>
            ),
        },
        {
            accessorKey: "isAdmin",
            header: () => (
                <Button variant="ghost" className="px-0" onClick={() => handleSort("isAdmin")}>
                    Is Admin
                    {sortBy === "isAdmin" ? (
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
            cell: ({ row }) => <p>{row.original.isAdmin ? "Yes" : "No"}</p>,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    title="Edit role"
                    onClick={() => openEditRole(row.original)}
                >
                    <Pencil className="size-4" />
                </Button>
            ),
        },
    ]

    const table = useReactTable({
        data: paginatedUsers,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <AppContent isAdminOnly>
            <div className="mb-4">
                <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                    Manage User
                </h1>
                <p className="text-muted-foreground">Manage email access for AuthenticatedUser and update role access.</p>
            </div>

            <div className="mb-4">
                <Button onClick={openAdd}>Add Email Access</Button>
            </div>

            <div className="space-y-4">
                <Field orientation="horizontal" className="flex items-center gap-2">
                    <Input
                        type="search"
                        placeholder="Search by email"
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
                                        No authenticated user found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Page {page} • {paginatedUsers.length} row(s)
                    </p>

                    <div className="flex items-center gap-2">
                        <Label htmlFor="page-size-user">Rows</Label>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(value) => {
                                setPage(1)
                                setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger id="page-size-user" className="w-20">
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    className="sm:max-w-md"
                    onInteractOutside={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Add New User Access</DialogTitle>
                        <DialogDescription>
                            Add a new email access for AuthenticatedUser.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field data-invalid={!!emailError}>
                            <FieldLabel htmlFor="manage-user-email">Email</FieldLabel>
                            <Input
                                id="manage-user-email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value)
                                    setEmailError("")
                                }}
                            />
                            {emailError && <FieldError errors={[{ message: emailError }]} />}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="manage-user-admin">Admin Access</FieldLabel>
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="manage-user-admin"
                                    checked={isAdmin}
                                    onCheckedChange={(checked) => setIsAdmin(Boolean(checked))}
                                />
                                <p className="text-sm text-muted-foreground">
                                    {isAdmin ? "This user will get admin role" : "This user will get regular role"}
                                </p>
                            </div>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={closeAdd}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleAddUser}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent
                    className="sm:max-w-md"
                    onInteractOutside={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Edit User Role</DialogTitle>
                        <DialogDescription>
                            Update admin access for the selected authenticated user.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input value={selectedUser?.email ?? ""} readOnly />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="manage-user-edit-admin">Admin Access</FieldLabel>
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="manage-user-edit-admin"
                                    checked={isAdmin}
                                    onCheckedChange={(checked) => setIsAdmin(Boolean(checked))}
                                />
                                <p className="text-sm text-muted-foreground">
                                    {isAdmin ? "This user has admin role" : "This user has regular role"}
                                </p>
                            </div>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={closeEditRole}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleUpdateRole}>Save changes</Button>
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

export default ManageUserPage