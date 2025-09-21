export interface Rule {
  id: string
  content: string
  order: number
  title?: string
  isNew?: boolean
  createdAt: Date
  updatedAt: Date
}
