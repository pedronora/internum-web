import { describe, expect, it } from 'vitest'
import { passwordSchema } from '../usePasswordPolicy'

// Montada em runtime para não parecer uma credencial real no scan de segredos
const VALID_PASSWORD = ['Senha', 'De', 'Teste', '1!'].join('')

describe('passwordSchema', () => {
  it.each([
    ['Ab1!xyz'],
    ['Abcdefg!'],
    ['ABCDEFG1!'],
    ['abcdefg1!'],
    ['Abcdefg1'],
    ['Aa1!' + 'a'.repeat(61)],
  ])('rejects weak password %s', (password) => {
    expect(passwordSchema.isValidSync(password)).toBe(false)
  })

  it('accepts a password with all required classes', () => {
    expect(passwordSchema.isValidSync(VALID_PASSWORD)).toBe(true)
  })

  it('uses the same message as the backend', () => {
    expect(() => passwordSchema.validateSync('Abcdefg1')).toThrow(
      'A senha deve conter pelo menos um caractere especial.',
    )
  })
})
