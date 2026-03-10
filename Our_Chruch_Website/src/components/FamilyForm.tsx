'use client'

import { useState } from 'react'
import { Family } from '@/types/records'

interface FamilyFormProps {
  onSubmit: (data: Partial<Family>) => void
  onCancel: () => void
}

export default function FamilyForm({ onSubmit, onCancel }: FamilyFormProps) {
  const [formData, setFormData] = useState<Partial<Family>>({
    family_code: '',
    family_name: '',
    residential_address: '',
    office_address: '',
    area: '',
  })

  const handleChange = (field: keyof Family, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="app-card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Family</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="app-form-grid">
          <div>
            <label className="app-label">Family Code (Unique)</label>
            <input
              type="text"
              value={formData.family_code || ''}
              onChange={e => handleChange('family_code', e.target.value)}
              className="app-input"
              placeholder="e.g., FAM001"
              required
            />
          </div>
          <div>
            <label className="app-label">Family Name</label>
            <input
              type="text"
              value={formData.family_name || ''}
              onChange={e => handleChange('family_name', e.target.value)}
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
            <label className="app-label">Residential Address</label>
            <input
              type="text"
              value={formData.residential_address || ''}
              onChange={e => handleChange('residential_address', e.target.value)}
              className="app-input"
            />
          </div>
          <div className="col-span-2">
            <label className="app-label">Office Address</label>
            <input
              type="text"
              value={formData.office_address || ''}
              onChange={e => handleChange('office_address', e.target.value)}
              className="app-input"
            />
          </div>
        </div>

        <div className="app-form-actions">
          <button type="button" onClick={onCancel} className="app-btn-secondary">
            Cancel
          </button>
          <button type="submit" className="app-btn-primary">
            Create Family
          </button>
        </div>
      </form>
    </div>
  )
}
