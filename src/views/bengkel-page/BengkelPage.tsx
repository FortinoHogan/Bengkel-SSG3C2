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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BengkelService } from "@/helpers/services/BengkelService"
import {
  AddBengkelDetailPayload,
  GetBengkelModulePayload,
  IBengkelDetail,
  IBengkelModule,
  IMsEnvironment,
  UpdateBengkelDetailPayload,
  UpdateBengkelModulePayload,
} from "@/interfaces/Bengkel.interface"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { IFormData } from "./interface"
import { InitialFormData, InitialFormError } from "./constant"
import { useTheme } from "@/helpers/provider/ThemeProvider"
import Editor from "@monaco-editor/react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Copy,
  Eye,
  FileBraces,
  Link,
  Pencil,
  Trash,
} from "lucide-react"

const BengkelPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { id } = useParams<{ id: string }>()
  const { theme } = useTheme()
  const [bengkelName, setBengkelName] = useState("")
  const [environmentData, setEnvironmentData] = useState<IMsEnvironment[]>()
  const [bengkelModuleData, setBengkelModuleData] = useState<IBengkelModule>()
  const [isLoading, setIsLoading] = useState(true)
  const [isShowError, setIsShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isShowSuccess, setIsShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedEnv, setSelectedEnv] = useState<string>("")
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedAuth, setCopiedAuth] = useState(false)
  const [formData, setFormData] = useState<IFormData>(InitialFormData)
  const [formError, setFormError] = useState<IFormData>(InitialFormError)
  const [bengkelDetailData, setBengkelDetailData] = useState<IBengkelDetail[]>([])
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<keyof IBengkelDetail | undefined>()
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [hasNextPage, setHasNextPage] = useState(false)
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add")
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null)
  const [isShowDeleteConfirm, setIsShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [moduleForm, setModuleForm] = useState({ baseUrl: "", basicAuth: "" })
  const [copiedRowId, setCopiedRowId] = useState<{
    id: number
    type: "endpoint" | "json"
  } | null>(null)

  const fetchEnvironments = async () => {
    const res = await BengkelService.getMasterEnvironmentList(setIsLoading)
    if (res.error) {
      setIsShowError(true)
      setErrorMessage(res.error || "Failed to fetch environment data.")
    } else if (res.data && res.data.length > 0) {
      setEnvironmentData(res.data)
    }
  }

  const fetchBengkel = async () => {
    const res = await BengkelService.getMasterBengkel(Number(id), setIsLoading)
    if (res.error) {
      setIsShowError(true)
      setErrorMessage(res.error || "Failed to fetch bengkel data.")
    } else if (res.data) {
      setBengkelName(res.data.bengkelName)
    } else {
      setBengkelName("Bengkel Not Found")
    }
  }

  const fetchBengkelModule = async () => {
    if (!selectedEnv) return

    const payload: GetBengkelModulePayload = {
      bengkelId: Number(id),
      environmentId: Number(selectedEnv),
    }

    const res = await BengkelService.getBengkelModule(payload, setIsLoading)
    if (res.error) {
      setIsShowError(true)
      setErrorMessage(res.error || "Failed to fetch bengkel module data.")
    } else if (res.data) {
      setBengkelModuleData(res.data)
    }
  }

  const fetchBengkelDetails = async () => {
    if (!id) return

    const res = await BengkelService.getBengkelDetailList(
      {
        bengkelId: Number(id),
        page,
        size: pageSize,
        searchQuery,
        sortBy,
        sortOrder,
      },
      setIsLoading
    )

    if (res.error) {
      setIsShowError(true)
      setErrorMessage(res.error || "Failed to fetch bengkel detail data.")
      setBengkelDetailData([])
      setHasNextPage(false)
      return
    }

    const rows = res.data ?? []
    setBengkelDetailData(rows)
    setHasNextPage(rows.length >= pageSize)
  }

  const handleValidateForm = () => {
    let isValid = true
    const errors: IFormData = { url: "", description: "", payload: "" }
    if (!formData.url.trim()) {
      errors.url = "Url is required"
      isValid = false
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required"
      isValid = false
    }
    if (!formData.payload.trim() || formData.payload === "{}") {
      errors.payload = "Payload is required"
      isValid = false
    } else {
      try {
        JSON.parse(formData.payload)
      } catch {
        errors.payload = "Payload must be valid JSON"
        isValid = false
      }
    }
    setFormError(errors)
    return isValid
  }

  const handleAdd = async () => {
    if (!handleValidateForm()) return

    const payload: AddBengkelDetailPayload = {
      url: formData.url,
      description: formData.description,
      payload: JSON.parse(formData.payload),
      bengkelId: bengkelModuleData?.bengkelId || 0,
    }

    const result = await BengkelService.addBengkelDetail(payload, setIsLoading)
    if (result.error) {
      setIsShowError(true)
      setErrorMessage(result.error || "Failed to add bengkel detail.")
    } else {
      setIsShowSuccess(true)
      setSuccessMessage("Bengkel added successfully")
      fetchBengkelDetails()
      handleCloseDialog()
    }
  }

  const handleEdit = async () => {
    if (!selectedDetailId) return
    if (!handleValidateForm()) return

    const payload: UpdateBengkelDetailPayload = {
      bengkelDetailId: selectedDetailId,
      url: formData.url,
      description: formData.description,
      payload: JSON.parse(formData.payload),
    }

    const result = await BengkelService.updateBengkelDetail(payload, setIsLoading)
    if (result.error) {
      setIsShowError(true)
      setErrorMessage(result.error || "Failed to update bengkel detail.")
    } else {
      setIsShowSuccess(true)
      setSuccessMessage("Bengkel detail updated successfully")
      fetchBengkelDetails()
      handleCloseDialog()
    }
  }

  const handleDelete = (bengkelDetailId: number) => {
    setDeleteTargetId(bengkelDetailId)
    setIsShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return

    const result = await BengkelService.deleteBengkelDetail(
      deleteTargetId,
      setIsLoading
    )
    setIsShowDeleteConfirm(false)
    setDeleteTargetId(null)

    if (result.error) {
      setIsShowError(true)
      setErrorMessage(result.error || "Failed to delete bengkel detail.")
      return
    }

    setIsShowSuccess(true)
    setSuccessMessage("Bengkel detail deleted successfully")
    fetchBengkelDetails()
  }

  const handleSearch = () => {
    setPage(1)
    setSearchQuery(searchInput.trim())
  }

  const handleSort = (column: keyof IBengkelDetail) => {
    setPage(1)

    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
      return
    }

    setSortBy(column)
    setSortOrder("asc")
  }

  const openAddDialog = () => {
    setDialogMode("add")
    setSelectedDetailId(null)
    setFormData(InitialFormData)
    setFormError(InitialFormError)
    setIsDialogOpen(true)
  }

  const openEditDialog = (detail: IBengkelDetail) => {
    setDialogMode("edit")
    setSelectedDetailId(detail.bengkelDetailId)
    setFormData({
      url: detail.url,
      description: detail.description,
      payload: JSON.stringify(detail.payload, null, 2),
    })
    setFormError(InitialFormError)
    setIsDialogOpen(true)
  }

  const openViewDialog = (detail: IBengkelDetail) => {
    setDialogMode("view")
    setSelectedDetailId(detail.bengkelDetailId)
    setFormData({
      url: detail.url,
      description: detail.description,
      payload: JSON.stringify(detail.payload, null, 2),
    })
    setFormError(InitialFormError)
    setIsDialogOpen(true)
  }

  const openModuleDialog = () => {
    setModuleForm({
      baseUrl: bengkelModuleData?.baseUrl ?? "",
      basicAuth: bengkelModuleData?.basicAuth ?? "",
    })
    setIsModuleDialogOpen(true)
  }

  const handleUpdateModule = async () => {
    if (!bengkelModuleData?.bengkelModuleId) {
      setIsShowError(true)
      setErrorMessage("Bengkel module not found.")
      return
    }

    const payload: UpdateBengkelModulePayload = {
      bengkelModuleId: bengkelModuleData.bengkelModuleId,
      baseUrl: moduleForm.baseUrl.trim(),
      basicAuth: moduleForm.basicAuth.trim(),
    }

    const result = await BengkelService.updateBengkelModule(payload, setIsLoading)
    if (result.error) {
      setIsShowError(true)
      setErrorMessage(result.error || "Failed to update module configuration.")
      return
    }

    setIsModuleDialogOpen(false)
    setIsShowSuccess(true)
    setSuccessMessage("Module configuration updated successfully")
    fetchBengkelModule()
  }

  const columns: ColumnDef<IBengkelDetail>[] = [
    {
      accessorKey: "No",
      header: "No",
      cell: ({ row }) => <p className="max-w-md truncate pl-2">{(page - 1) * pageSize + row.index + 1}</p>,
    },
    {
      accessorKey: "url",
      header: () => (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => handleSort("url")}
        >
          URL
          {sortBy === "url" ? (
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
        <p className="max-w-md truncate" title={row.original.url}>
          {row.original.url}
        </p>
      ),
    },
    {
      accessorKey: "description",
      header: () => (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => handleSort("description")}
        >
          Description
          {sortBy === "description" ? (
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
        <p className="max-w-sm truncate" title={row.original.description}>
          {row.original.description}
        </p>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const bengkelDetailId = row.original.bengkelDetailId
        const isEndpointCopied =
          copiedRowId?.id === bengkelDetailId &&
          copiedRowId?.type === "endpoint"
        const isJsonCopied =
          copiedRowId?.id === bengkelDetailId && copiedRowId?.type === "json"

        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(row.original.url)
                setCopiedRowId({ id: bengkelDetailId, type: "endpoint" })
                setTimeout(() => setCopiedRowId(null), 1500)
              }}
              title="Copy endpoint"
            >
              {isEndpointCopied ? (
                <Check className="size-4" color="green" />
              ) : (
                <Link className="size-4" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  JSON.stringify(row.original.payload, null, 2)
                )
                setCopiedRowId({ id: bengkelDetailId, type: "json" })
                setTimeout(() => setCopiedRowId(null), 1500)
              }}
              title="Copy JSON payload"
            >
              {isJsonCopied ? (
                <Check className="size-4" color="green" />
              ) : (
                <FileBraces className="size-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                openViewDialog(row.original)
              }}
              title="View detail"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                openEditDialog(row.original)
              }}
              title="Edit detail"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                handleDelete(bengkelDetailId)
              }}
              title="Delete detail"
            >
              <Trash className="size-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: bengkelDetailData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleCopy = async (text: string, type: "url" | "auth") => {
    if (!text) return

    await navigator.clipboard.writeText(text)
    if (type === "url") {
      setCopiedUrl(true)
    } else if (type === "auth") {
      setCopiedAuth(true)
    }

    setTimeout(() => {
      if (type === "url") {
        setCopiedUrl(false)
      } else if (type === "auth") {
        setCopiedAuth(false)
      }
    }, 1500)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setDialogMode("add")
    setSelectedDetailId(null)
    setFormData(InitialFormData)
    setFormError(InitialFormError)
  }

  const isViewMode = dialogMode === "view"
  const isEditMode = dialogMode === "edit"

  const handleDownload = () => {
    const data = bengkelModuleData?.postmanEnv as any;
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name || "postman-env"}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      await fetchEnvironments()
      await fetchBengkel()
    }

    fetchMasterData()
  }, [id])

  useEffect(() => {
    if (environmentData && environmentData.length > 0) {
      setSelectedEnv(String(environmentData[0].environmentId))
      fetchBengkelModule()
    }
  }, [environmentData])

  useEffect(() => {
    fetchBengkelModule()
  }, [selectedEnv])

  useEffect(() => {
    fetchBengkelDetails()
  }, [id, page, pageSize, searchQuery, sortBy, sortOrder])

  return (
    <AppContent>
      <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        {bengkelName && `Bengkel ${bengkelName}`}
      </h1>
      <p className="mb-4 text-muted-foreground">Ini page list bengkel</p>
      <div className="mb-4">
        <Field>
          <FieldLabel>Environment</FieldLabel>
          <div className="flex items-center gap-4">
            <Select value={selectedEnv || ""} onValueChange={setSelectedEnv}>
              <SelectTrigger className="w-full max-w-52">
                <SelectValue
                  placeholder="Select an environment"
                  defaultValue={String(environmentData?.[0]?.environmentId)}
                />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectLabel>Select Environment</SelectLabel>
                  {environmentData?.map((env) => (
                    <SelectItem
                      key={env.environmentId}
                      value={String(env.environmentId) || ""}
                    >
                      {env.environmentName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button onClick={openModuleDialog} title="Edit Environment">
              <Pencil className="size-4" />
            </Button>
          </div>
        </Field>
      </div>
      <div className="flex mb-4 w-fit items-center gap-4">
        <p className="whitespace-nowrap">Base Url</p>
        <InputGroup className="w-full">
          <InputGroupAddon>
            <InputGroupText>{bengkelModuleData?.baseUrl}</InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon
            align="inline-end"
            className="cursor-pointer pl-2"
            onClick={() => {
              handleCopy(bengkelModuleData?.baseUrl || "", "url")
            }}
          >
            {copiedUrl ? <Check color="green" /> : <Copy />}
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex mb-4 w-fit items-center gap-4">
        <p className="whitespace-nowrap">Basic Auth</p>
        <InputGroup className="w-full">
          <InputGroupAddon>
            <InputGroupText>{bengkelModuleData?.basicAuth}</InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon
            align="inline-end"
            className="cursor-pointer pl-2"
            onClick={() => {
              handleCopy(bengkelModuleData?.basicAuth || "", "auth")
            }}
          >
            {copiedAuth ? <Check color="green" /> : <Copy />}
          </InputGroupAddon>
        </InputGroup>
      </div>
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bengkel Module</DialogTitle>
            <DialogDescription>
              Update Base Url and Basic Auth for this module.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="module-base-url">Base Url</FieldLabel>
              <Input
                id="module-base-url"
                value={moduleForm.baseUrl || ""}
                onChange={(e) =>
                  setModuleForm((prev) => ({ ...prev, baseUrl: e.target.value }))
                }
                placeholder="https://api.example.com"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="module-basic-auth">Basic Auth</FieldLabel>
              <Input
                id="module-basic-auth"
                value={moduleForm.basicAuth || ""}
                onChange={(e) =>
                  setModuleForm((prev) => ({ ...prev, basicAuth: e.target.value }))
                }
                placeholder="Basic xxxxx"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateModule}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          <div className="flex items-center gap-4 mb-4">
            <Button variant={"secondary"} onClick={() => handleDownload()}>Download Environment</Button>
            <Button onClick={openAddDialog}>Add New</Button>
            <DialogContent
              className="sm:max-w-4xl max-h-[calc(100dvh-2rem)] overflow-y-auto"
              onInteractOutside={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>
                  {isViewMode ? "Bengkel Detail" : isEditMode ? "Edit Bengkel Detail" : "Add New Bengkel"}
                </DialogTitle>
                <DialogDescription>
                  {isViewMode
                    ? "Review bengkel detail information."
                    : isEditMode
                      ? "Update the detail and save your changes."
                      : "Fill in the details to add a new bengkel. Click save when you're done."}
                </DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <Field data-invalid={!isViewMode && !!formError.url}>
                  <FieldLabel htmlFor="url">Url</FieldLabel>
                  <Input
                    id="url"
                    name="url"
                    placeholder="/bengkel/"
                    value={formData.url || ""}
                    readOnly={isViewMode}
                    onChange={(e) => {
                      setFormData({ ...formData, url: e.target.value })
                      setFormError({ ...formError, url: "" })
                    }}
                  />
                  {!isViewMode && formError.url && (
                    <FieldError errors={[{ message: formError.url }]} />
                  )}
                </Field>
                <Field data-invalid={!isViewMode && !!formError.description}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Enter description"
                    value={formData.description || ""}
                    readOnly={isViewMode}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value })
                      setFormError({ ...formError, description: "" })
                    }}
                  />
                  {!isViewMode && formError.description && (
                    <FieldError errors={[{ message: formError.description }]} />
                  )}
                </Field>
                <Field data-invalid={!isViewMode && !!formError.payload}>
                  <FieldLabel htmlFor="payload">Payload</FieldLabel>
                  <Editor
                    height="300px"
                    defaultLanguage="json"
                    value={formData.payload || ""}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      readOnly: isViewMode,
                    }}
                    onChange={(value) => {
                      setFormData({ ...formData, payload: value || "" })
                      setFormError({ ...formError, payload: "" })
                    }}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    className="rounded-lg border bg-background text-foreground shadow-sm"
                  />
                  {!isViewMode && formError.payload && (
                    <FieldError errors={[{ message: formError.payload }]} />
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
                  <Button onClick={isEditMode ? handleEdit : handleAdd}>Save changes</Button>
                )}
              </DialogFooter>
            </DialogContent>
          </div>
        </Dialog>
      </div>
      <div className="space-y-4">
        <Field orientation="horizontal" className="flex items-center gap-2">
          <Input
            type="search"
            placeholder="Search by url or description"
            value={searchInput || ""}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
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
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            Page {page} • {bengkelDetailData.length} row(s)
          </p>

          <div className="flex items-center gap-2">
            <Label htmlFor="page-size">Rows</Label>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPage(1)
                setPageSize(Number(value))
              }}
            >
              <SelectTrigger id="page-size" className="w-20">
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
      <AppModal
        open={isShowError}
        title="Error"
        description={errorMessage}
        onClose={() => {
          setIsShowError(false)
          setErrorMessage("")
        }}
        onSubmit={() => {
          setIsShowError(false)
          setErrorMessage("")
        }}
      />
      <AppModal
        open={isShowSuccess}
        title="Success"
        description={successMessage}
        onClose={() => {
          setIsShowSuccess(false)
          setSuccessMessage("")
        }}
        onSubmit={() => {
          setIsShowSuccess(false)
          setSuccessMessage("")
        }}
      />
      <AppModal
        open={isShowDeleteConfirm}
        title="Delete Confirmation"
        description="Are you sure you want to delete this detail?"
        isShowCancel={true}
        onClose={() => {
          setIsShowDeleteConfirm(false)
          setDeleteTargetId(null)
        }}
        onSubmit={handleConfirmDelete}
      />
      {isLoading && <AppSpinner />}
    </AppContent>
  )
}

export default BengkelPage
