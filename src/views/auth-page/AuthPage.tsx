import { useState, type FormEvent } from 'react'
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field"
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import AppModal from '@/components/app-components/app-modal/AppModal'
import { useAuth } from '@/helpers/provider/AuthProvider'
import { UserService } from '@/helpers/services/UserService'

const AuthPage = () => {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const {
        handleLoginAuth,
        authMessage,
        authStatus,
        setAuthStatus,
        setAuthMessage,
        setProfile,
    } = useAuth()

    const onLogin = async (event: FormEvent) => {
        event.preventDefault();
        setAuthStatus('idle');
        setAuthMessage('');
        setIsLoading(true);
        const { data, error } = await UserService.getUserByEmail(email, setIsLoading);
        if (error || !data) {
            setAuthStatus('error');
            setAuthMessage('Account is not authenticated');
            return;
        }

        if (error || !data) {
            setAuthStatus('error');
            setAuthMessage('Account is not authenticated');
            return;
        }
        setProfile(data);
        handleLoginAuth(email);
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend className='text-center'>Sign In</FieldLegend>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        id="checkout-7j9-card-name-43j"
                                        placeholder="Enter your email"
                                        required
                                        onChange={(e) => setEmail(e.target.value)}
                                        type='email'
                                    />
                                </Field>
                            </FieldGroup>
                        </FieldSet>

                        <Field orientation="horizontal" className="justify-center">
                            <Button variant="default" type="submit" disabled={isLoading} onClick={onLogin}>
                                {isLoading ? <Spinner /> : 'Send Verification'}
                            </Button>
                        </Field>
                    </FieldGroup>
                </div>
            </div>
            <AppModal
                open={authStatus !== 'idle'}
                title={authStatus === 'error' ? 'Error' : 'Authentication'}
                description={authMessage}
                onSubmit={() => { setAuthStatus('idle'); setAuthMessage(''); }}
            />
        </div>
    )
}

export default AuthPage