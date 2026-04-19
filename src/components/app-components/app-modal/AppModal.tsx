import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog'
import type { AppModalProps } from './AppModal.interface'

const AppModal = (props: AppModalProps) => {
    const { open, onClose, onSubmit, title, description, isShowCancel = false } = props;
    
    return (
        <AlertDialog open={open} onOpenChange={onClose}> 
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter
                    className={`flex items-center ${isShowCancel ? "justify-end!" : "justify-center!"
                        }`}
                >
                    {isShowCancel && (
                        <AlertDialogCancel onClick={onClose}>
                            Cancel
                        </AlertDialogCancel>
                    )}
                    <AlertDialogAction onClick={onSubmit}>
                        OK
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AppModal