/**
 * Admin sign-in dialog.
 *
 * `onLogin` resolves when the credentials are valid and throws with a
 * human readable message otherwise — the error is shown inline and toasted.
 */

import { useEffect, useState, type FormEvent, type JSX } from 'react';
import { AlertCircle } from 'lucide-react';

import { Button } from '../ui/Button';
import { TextInput } from '../ui/Field';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

export interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
}

const FORM_ID = 'login-modal-form';

/**
 * E-mail de administrador configurado no build.
 *
 * O placeholder precisa bater com o e-mail real: é o mesmo que a RLS
 * compara (`auth.jwt() ->> 'email'`) e o mesmo que o `schema.sql` usa
 * no bloco de políticas. Um placeholder fixo mente assim que o técnico
 * troca o e-mail.
 */
const ADMIN_EMAIL_PLACEHOLDER =
  import.meta.env.VITE_ADMIN_EMAIL?.trim() || 'admin@fortaltech.com.br';

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return fallback;
}

export function LoginModal({ open, onClose, onLogin }: LoginModalProps): JSX.Element {
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Informe o e-mail e a senha para continuar.');
      return;
    }

    setPending(true);
    setError(null);

    try {
      await onLogin(trimmedEmail, password);
      setPassword('');
      toast.success('Bem-vindo ao painel', 'Acesso administrativo liberado.');
    } catch (loginError) {
      const message = errorMessage(loginError, 'Não foi possível entrar no painel.');
      setError(message);
      toast.error('Erro no login', message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Acesso administrativo"
      description="Entre com as credenciais da conta de administrador da Fortal Tech."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={pending}>
            {pending ? 'Entrando...' : 'Entrar'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <TextInput
          label="E-mail"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={ADMIN_EMAIL_PLACEHOLDER}
        />

        <TextInput
          label="Senha"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
        />
      </form>
    </Modal>
  );
}
