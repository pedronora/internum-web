import * as yup from 'yup'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 64
export const PASSWORD_LENGTH_MESSAGE =
  'A senha deve ter entre 8 e 64 caracteres.'

export const passwordSchema = yup
  .string()
  .required('A senha é obrigatória')
  .min(PASSWORD_MIN_LENGTH, PASSWORD_LENGTH_MESSAGE)
  .max(PASSWORD_MAX_LENGTH, PASSWORD_LENGTH_MESSAGE)
  .matches(/\d/, 'A senha deve conter pelo menos um dígito.')
  .matches(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula.')
  .matches(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
  .matches(
    /[^a-zA-Z0-9]/,
    'A senha deve conter pelo menos um caractere especial.',
  )
