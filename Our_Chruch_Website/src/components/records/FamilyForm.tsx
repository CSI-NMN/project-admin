'use client'

import { useEffect, useState } from 'react'
import { Family } from '@/types/records'

interface FamilyFormProps {
  onSubmit: (data: Partial<Family>) => void
  onCancel: () => void
  initialData?: Partial<Family>
  isEdit?: boolean
}

const getInitialState = (initialData?: Partial<Family>): Partial<Family> => ({
  familyCode: initialData?.familyCode || '',
  familyName: initialData?.familyName || '',
  address1: initialData?.address1 || '',
  area: initialData?.area || '',
  address2: initialData?.address2 || '',
  pincode: initialData?.pincode || '',
  city: initialData?.city || '',
  state: initialData?.state || '',
})

export default function FamilyForm({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
}: FamilyFormProps) {
  const [formData, setFormData] = useState<Partial<Family>>(getInitialState(initialData))

  useEffect(() => {
    setFormData(getInitialState(initialData))
  }, [initialData])

  const handleChange = (field: keyof Family, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { id, createdAt, updatedAt, members, ...payload } = formData
    void id
    void createdAt
    void updatedAt
    void members

    if (!isEdit) {
      onSubmit({ ...payload, familyCode: undefined })
      return
    }

    const changedPayload: Partial<Family> = {}
    const base = initialData || {}
    const fields = Object.keys(payload) as (keyof Family)[]

    fields.forEach(field => {
      const currentValue = payload[field]
      const previousValue = base[field]

      const normalizedCurrent =
        typeof currentValue === 'string' && currentValue.trim() === '' ? undefined : currentValue
      const normalizedPrevious =
        typeof previousValue === 'string' && previousValue.trim() === '' ? undefined : previousValue

      if (normalizedCurrent !== normalizedPrevious) {
        changedPayload[field] = currentValue
      }
    })

    onSubmit(changedPayload)
  }

  return (
    <div className="app-card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Family Details' : 'Create New Family'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="app-form-grid">
          {isEdit && (
            <div>
              <label className="app-label">Family Code</label>
              <input type="text" value={formData.familyCode || ''} className="app-input" readOnly />
            </div>
          )}
          <div>
            <label className="app-label">Family Name</label>
            <input
              type="text"
              value={formData.familyName || ''}
              onChange={e => handleChange('familyName', e.target.value)}
              className="app-input"
              required
            />
          </div>
          <div>
            <label className="app-label">House Number, Street Name</label>
            <input
              type="text"
              value={formData.address1 || ''}
              onChange={e => handleChange('address1', e.target.value)}
              className="app-input"
              required
            />
          </div>
          <div>
            <label className="app-label">Area</label>
            <input
              type="text"
              value={formData.area || ''}
              onChange={e => handleChange('area', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Landmark (Optional)</label>
            <input
              type="text"
              value={formData.address2 || ''}
              onChange={e => handleChange('address2', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Pincode</label>
            <input
              type="text"
              value={formData.pincode || ''}
              onChange={e => handleChange('pincode', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">City</label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={e => handleChange('city', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">State</label>
            <input
              type="text"
              value={formData.state || ''}
              onChange={e => handleChange('state', e.target.value)}
              className="app-input"
            />
          </div>
        </div>

        <div className="app-form-actions">
          <button type="button" onClick={onCancel} className="app-btn-secondary">
            Cancel
          </button>
          <button type="submit" className="app-btn-primary">
            {isEdit ? 'Save Family' : 'Create Family'}
          </button>
        </div>
      </form>
    </div>
  )
}

