export interface AppModalProps {
  open: boolean
  onClose?: () => void
  onSubmit: () => void
  title: string
  description: string
  isShowCancel?: boolean
}
