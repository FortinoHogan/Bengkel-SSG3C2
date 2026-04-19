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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { BengkelService } from "@/helpers/services/BengkelService"
import { IBengkelModule, IMsEnvironment, UpdateBengkelModulePayload } from "@/interfaces/Bengkel.interface"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Download, Eye, Pencil } from "lucide-react"
import { ChangeEvent, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ModuleFormData } from "./interface"
import { DialogMode, InitialModuleFormData } from "./constant"
import { Editor } from "@monaco-editor/react"
import { useTheme } from "@/helpers/provider/ThemeProvider"

const EnvironmentManagementPage = () => {
    const { id } = useParams<{ id: string }>()
    const { theme } = useTheme()
    const [isLoading, setIsLoading] = useState(true)
    const [modules, setModules] = useState<IBengkelModule[]>([])
    const [environments, setEnvironments] = useState<IMsEnvironment[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<DialogMode>("view")
    const [selectedModule, setSelectedModule] = useState<IBengkelModule | null>(null)
    const [formData, setFormData] = useState<ModuleFormData>(InitialModuleFormData)
    const [formDataError, setFormDataError] = useState<ModuleFormData>(InitialModuleFormData)
    const [isShowError, setIsShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [isShowSuccess, setIsShowSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")

    const fetchData = async () => {
        if (!id) return
        const [modulesRes, envRes] = await Promise.all([
            BengkelService.getBengkelModuleList(Number(id), setIsLoading),
            BengkelService.getMasterEnvironmentList(),
        ])
        if (modulesRes.error) {
            setIsShowError(true)
            setErrorMessage(modulesRes.error || "Failed to fetch modules.")
        } else {
            setModules(modulesRes.data ?? [])
        }
        if (!envRes.error && envRes.data) {
            setEnvironments(envRes.data)
        }
    }

    const getEnvName = (environmentId: number) =>
        environments.find((e) => e.environmentId === environmentId)?.environmentName ?? String(environmentId)

    const handleDownloadPostmanEnv = (module: IBengkelModule) => {
        const data = module.postmanEnv as any
        if (!data) return

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = `${data.name || "postman-env"}.json`
        link.click()

        URL.revokeObjectURL(url)
    }

    const handleUploadPostmanEnv = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const fileContent = await file.text()
            const parsedJson = JSON.parse(fileContent)
            setFormData((prev) => ({
                ...prev,
                postmanEnvJson: JSON.stringify(parsedJson, null, 2),
            }))
            setFormDataError((prev) => ({ ...prev, postmanEnvJson: "" }))
        } catch {
            setFormDataError((prev) => ({
                ...prev,
                postmanEnvJson: "Invalid JSON file",
            }))
        }

        event.target.value = ""
    }

    const openView = (module: IBengkelModule) => {
        setSelectedModule(module)
        setFormData({
            baseUrl: module.baseUrl,
            basicAuth: module.basicAuth,
            postmanEnvJson: JSON.stringify(module.postmanEnv ?? {}, null, 2),
        })
        setFormDataError(InitialModuleFormData)
        setDialogMode("view")
        setIsDialogOpen(true)
    }

    const openEdit = (module: IBengkelModule) => {
        setSelectedModule(module)
        setFormData({
            baseUrl: module.baseUrl,
            basicAuth: module.basicAuth,
            postmanEnvJson: JSON.stringify(module.postmanEnv ?? {}, null, 2),
        })
        setFormDataError(InitialModuleFormData)
        setDialogMode("edit")
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setSelectedModule(null)
        setFormDataError(InitialModuleFormData)
    }

    const handleSave = async () => {
        if (!selectedModule) return

        let parsedPostmanEnv: JSON
        try {
            parsedPostmanEnv = JSON.parse(formData.postmanEnvJson || "{}") as JSON
            setFormDataError(InitialModuleFormData)
        } catch {
            setFormDataError({ ...InitialModuleFormData, postmanEnvJson: "Invalid JSON format" })
            return
        }

        const payload: UpdateBengkelModulePayload = {
            bengkelModuleId: selectedModule.bengkelModuleId,
            baseUrl: formData.baseUrl ? formData.baseUrl.trim() : "",
            basicAuth: formData.basicAuth ? formData.basicAuth.trim() : "",
            postmanEnv: parsedPostmanEnv,
        }
        const result = await BengkelService.updateBengkelModule(payload, setIsLoading)
        if (result.error) {
            setIsShowError(true)
            setErrorMessage(result.error || "Failed to update module.")
            return
        }
        setIsDialogOpen(false)
        setSelectedModule(null)
        setIsShowSuccess(true)
        setSuccessMessage("Module updated successfully")
        fetchData()
    }

    const isViewMode = dialogMode === "view"

    const columns: ColumnDef<IBengkelModule>[] = [
        {
            id: "no",
            header: "No",
            cell: ({ row }) => <p className="max-w-md truncate pl-2">{row.index + 1}</p>,
        },
        {
            accessorKey: "environmentId",
            header: "Environment",
            cell: ({ row }) => <p className="max-w-md truncate">{getEnvName(row.original.environmentId)}</p>,
        },
        {
            accessorKey: "baseUrl",
            header: "Base URL",
            cell: ({ row }) => (
                <p className="max-w-xs truncate" title={row.original.baseUrl}>
                    {row.original.baseUrl}
                </p>
            ),
        },
        {
            accessorKey: "basicAuth",
            header: "Basic Auth",
            cell: ({ row }) => (
                <p className="max-w-xs truncate" title={row.original.basicAuth}>
                    {row.original.basicAuth}
                </p>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const mod = row.original
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            title="View"
                            onClick={() => openView(mod)}
                        >
                            <Eye className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            title="Edit"
                            onClick={() => openEdit(mod)}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            title="Download Postman Env"
                            onClick={() => handleDownloadPostmanEnv(mod)}
                        >
                            <Download className="size-4" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: modules,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    useEffect(() => {
        fetchData()
    }, [id])

    return (
        <AppContent>
            <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                Environment Management
            </h1>
            <p className="mb-4 text-muted-foreground">Ini page buat configure env bengkel</p>
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
                                    No modules found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    className="sm:max-w-4xl"
                    onInteractOutside={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>
                            {isViewMode ? "Module Detail" : "Edit Module"}
                        </DialogTitle>
                        <DialogDescription>
                            {isViewMode
                                ? "Review module configuration."
                                : "Update Base URL, Basic Auth, and Postman Env JSON, then save."}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Environment</FieldLabel>
                            <Input
                                value={selectedModule ? getEnvName(selectedModule.environmentId) : ""}
                                readOnly
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="env-base-url">Base URL</FieldLabel>
                            <Input
                                id="env-base-url"
                                value={formData.baseUrl || ""}
                                readOnly={isViewMode}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, baseUrl: e.target.value }))
                                }
                                placeholder="https://api.example.com"
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="env-basic-auth">Basic Auth</FieldLabel>
                            <Input
                                id="env-basic-auth"
                                value={formData.basicAuth || ""}
                                readOnly={isViewMode}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, basicAuth: e.target.value }))
                                }
                                placeholder="xxxx"
                            />
                        </Field>
                        <Field data-invalid={!isViewMode && !!formDataError.postmanEnvJson}>
                            <FieldLabel htmlFor="env-postman-json">Postman Env JSON</FieldLabel>
                            {!isViewMode && (
                                <Input
                                    id="postman-env-file"
                                    type="file"
                                    accept=".json,application/json"
                                    onChange={handleUploadPostmanEnv}
                                />
                            )}
                            <Editor
                                height="400px"
                                defaultLanguage="json"
                                value={formData.postmanEnvJson || ""}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    readOnly: isViewMode,
                                }}
                                onChange={(value) => {
                                    setFormData((prev) => ({ ...prev, postmanEnvJson: value || "" }))
                                    setFormDataError((prev) => ({ ...prev, postmanEnvJson: "" }))
                                }}
                                theme={theme === "dark" ? "vs-dark" : "light"}
                                className="rounded-lg border bg-background text-foreground shadow-sm"
                            />
                            {!isViewMode && formDataError.postmanEnvJson && (
                                <FieldError errors={[{ message: formDataError.postmanEnvJson }]} />
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

export default EnvironmentManagementPage

