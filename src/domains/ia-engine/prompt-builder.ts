export type StructuredPromptFields = {
  role_persona: string
  context_environment: string
  objective: string
  specific_task: string
  constraints: string
  output_format: string
  target_audience: string
}

const SECTIONS: { key: keyof StructuredPromptFields; label: string }[] = [
  { key: 'role_persona', label: 'Rol / Persona' },
  { key: 'context_environment', label: 'Contexto / Entorno' },
  { key: 'objective', label: 'Objetivo' },
  { key: 'specific_task', label: 'Tarea específica' },
  { key: 'constraints', label: 'Restricciones / Limitaciones' },
  { key: 'output_format', label: 'Formato de salida' },
  { key: 'target_audience', label: 'Público objetivo' },
]

export function buildStructuredPrompt(prompt: StructuredPromptFields): string {
  const parts = SECTIONS.map(({ key, label }) => {
    const value = prompt[key]?.trim() ?? ''
    return `${label}:\n${value}`
  })

  const hasContent = SECTIONS.some(({ key }) => (prompt[key]?.trim() ?? '').length > 0)
  if (!hasContent) {
    return 'Completá los campos estructurados para generar la vista previa.'
  }

  return parts.join('\n\n')
}
