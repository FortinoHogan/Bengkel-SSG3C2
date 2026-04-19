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
  DialogTrigger,
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
  GetBengkelModuleListPayload,
  IBengkelDetail,
  IBengkelModule,
  IMsEnvironment,
} from "@/interfaces/Bengkel.interface"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { IFormData } from "./BengkelPage.interface"
import { InitialFormData, InitialFormError } from "./BengkelPage.constant"
import { useTheme } from "@/helpers/provider/ThemeProvider"
import Editor from "@monaco-editor/react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Copy } from "lucide-react"

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
  const [formData, setFormData] = useState<IFormData>(InitialFormData)
  const [formError, setFormError] = useState<IFormData>(InitialFormError)

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

    const payload: GetBengkelModuleListPayload = {
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
      bengkelModuleId: bengkelModuleData?.bengkelModuleId || 0,
    }

    const result = await BengkelService.addBengkelDetail(payload, setIsLoading)
    if (result.error) {
      setIsShowError(true)
      setErrorMessage(result.error || "Failed to add bengkel detail.")
    } else {
      setIsShowSuccess(true)
      setSuccessMessage("Bengkel added successfully")
    }
  }

  const handleCopy = async (value: string) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setFormData(InitialFormData)
  }

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

  return (
    <AppContent>
      <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        {bengkelName && `Bengkel ${bengkelName}`}
      </h1>
      <div className="mb-4 flex items-center gap-4">
        <Select value={selectedEnv} onValueChange={setSelectedEnv}>
          <SelectTrigger className="w-full max-w-52">
            <SelectValue
              placeholder="Select an environment"
              defaultValue={String(environmentData?.[0]?.environmentId)}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select Environment</SelectLabel>
              {environmentData?.map((env) => (
                <SelectItem
                  key={env.environmentId}
                  value={String(env.environmentId)}
                >
                  {env.environmentName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Dialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          modal={false}
        >
          <div>
            <Button onClick={() => setIsDialogOpen(true)}>Add New</Button>
            <DialogContent
              className="sm:max-w-4xl"
              onInteractOutside={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>Add New Bengkel</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new bengkel. Click save when
                  you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <Field data-invalid={!!formError.url}>
                  <FieldLabel htmlFor="url">Url</FieldLabel>
                  <Input
                    id="url"
                    name="url"
                    placeholder="/bengkel/"
                    value={formData.url}
                    onChange={(e) => {
                      setFormData({ ...formData, url: e.target.value })
                      setFormError({ ...formError, url: "" })
                    }}
                  />
                  {formError.url && (
                    <FieldError errors={[{ message: formError.url }]} />
                  )}
                </Field>
                <Field data-invalid={!!formError.description}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value })
                      setFormError({ ...formError, description: "" })
                    }}
                  />
                  {formError.description && (
                    <FieldError errors={[{ message: formError.description }]} />
                  )}
                </Field>
                <Field data-invalid={!!formError.payload}>
                  <FieldLabel htmlFor="payload">Payload</FieldLabel>
                  <Editor
                    height="300px"
                    defaultLanguage="json"
                    value={formData.payload}
                    onChange={(value) => {
                      setFormData({ ...formData, payload: value || "" })
                      setFormError({ ...formError, payload: "" })
                    }}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                    className="rounded-lg border bg-background text-foreground shadow-sm"
                  />
                  {formError.payload && (
                    <FieldError errors={[{ message: formError.payload }]} />
                  )}
                </Field>
              </FieldGroup>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button onClick={handleAdd}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </div>
        </Dialog>
      </div>
      <div className="mb-4 flex w-fit items-center gap-4">
        <p className="whitespace-nowrap">Base Url</p>
        <InputGroup className="w-full">
          <InputGroupAddon>
            <InputGroupText>{bengkelModuleData?.baseUrl}</InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon
            align="inline-end"
            className="cursor-pointer pl-2"
            onClick={() => {
              handleCopy(bengkelModuleData?.baseUrl || "")
            }}
          >
            <Copy />
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="mb-4 flex w-fit items-center gap-4">
        <p className="whitespace-nowrap">Basic Auth</p>
        <InputGroup className="w-full">
          <InputGroupAddon>
            <InputGroupText>{bengkelModuleData?.basicAuth}</InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon
            align="inline-end"
            className="cursor-pointer pl-2"
            onClick={() => {
              handleCopy(bengkelModuleData?.basicAuth || "")
            }}
          >
            <Copy />
          </InputGroupAddon>
        </InputGroup>
      </div>
      <Field orientation="horizontal">
        <Input type="search" placeholder="Search..." />
        <Button>Search</Button>
      </Field>
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
          window.location.reload()
        }}
        onSubmit={() => {
          window.location.reload()
        }}
      />
      {isLoading && <AppSpinner />}
    </AppContent>
  )
}

export default BengkelPage
