'use client'

import { useState } from 'react'
import { Family, Person } from '@/types/records'

interface RecordsFormProps {
  initialData?: Partial<Person>
  isNew: boolean
  families: Family[]
  onSubmit: (data: Partial<Person>) => void
  onCancel: () => void
  hideFamily?: boolean
}

export default function RecordsForm({
  initialData,
  isNew,
  families,
  onSubmit,
  onCancel,
  hideFamily = false,
}: RecordsFormProps) {
  const [formData, setFormData] = useState<Partial<Person>>(
    initialData || {
      id: '',
      subscriptionCardNo: '',
      first_name: '',
      last_name: '',
      relationship_type: 'Child',
      is_head: false,
      familyId: '',
    }
  )

  const handleChange = (field: keyof Person, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="app-card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {isNew ? 'Create New Person Record' : 'Edit Person Record'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="app-form-grid">
          <div>
            <label className="app-label">First Name</label>
            <input
              type="text"
              value={formData.first_name || ''}
              onChange={e => handleChange('first_name', e.target.value)}
              className="app-input"
              required
            />
          </div>
          <div>
            <label className="app-label">Last Name</label>
            <input
              type="text"
              value={formData.last_name || ''}
              onChange={e => handleChange('last_name', e.target.value)}
              className="app-input"
              required
            />
          </div>
          <div>
            <label className="app-label">Subscription Card No</label>
            <input
              type="text"
              value={formData.subscriptionCardNo || ''}
              onChange={e => handleChange('subscriptionCardNo', e.target.value)}
              className="app-input"
              required
            />
          </div>
          <div>
            <label className="app-label">Relationship Type</label>
            <select
              value={formData.relationship_type || ''}
              onChange={e => handleChange('relationship_type', e.target.value)}
              className="app-input"
            >
              <option value="Head">Head</option>
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
            </select>
          </div>
          <div>
            <label className="app-label">Gender</label>
            <select
              value={formData.gender || ''}
              onChange={e => handleChange('gender', e.target.value)}
              className="app-input"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="app-label">Marital Status</label>
            <select
              value={formData.marital_status || ''}
              onChange={e => handleChange('marital_status', e.target.value)}
              className="app-input"
            >
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
          <div>
            <label className="app-label">Date of Birth</label>
            <input
              type="date"
              value={formData.date_of_birth || ''}
              onChange={e => handleChange('date_of_birth', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Mobile No</label>
            <input
              type="tel"
              value={formData.mobile_no || ''}
              onChange={e => handleChange('mobile_no', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={e => handleChange('email', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Profession</label>
            <input
              type="text"
              value={formData.profession || ''}
              onChange={e => handleChange('profession', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Blood Group</label>
            <select
              value={formData.blood_group || ''}
              onChange={e => handleChange('blood_group', e.target.value)}
              className="app-input"
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label className="app-label">Father Name</label>
            <input
              type="text"
              value={formData.father_name || ''}
              onChange={e => handleChange('father_name', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Mother Name</label>
            <input
              type="text"
              value={formData.mother_name || ''}
              onChange={e => handleChange('mother_name', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Date of Baptism</label>
            <input
              type="date"
              value={formData.date_of_baptism || ''}
              onChange={e => handleChange('date_of_baptism', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Date of Confirmation</label>
            <input
              type="date"
              value={formData.date_of_confirmation || ''}
              onChange={e => handleChange('date_of_confirmation', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Date of Marriage</label>
            <input
              type="date"
              value={formData.date_of_marriage || ''}
              onChange={e => handleChange('date_of_marriage', e.target.value)}
              className="app-input"
            />
          </div>
          {isNew && !hideFamily && (
            <div>
              <label className="app-label">Family</label>
              <select
                value={formData.familyId || ''}
                onChange={e => handleChange('familyId', e.target.value)}
                className="app-input"
                required
              >
                <option value="">Select Family</option>
                {families.map(family => (
                  <option key={family.id} value={family.id}>
                    {family.family_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="app-form-actions">
          <button type="button" onClick={onCancel} className="app-btn-secondary">
            Cancel
          </button>
          <button type="submit" className="app-btn-primary">
            {isNew ? 'Create Person' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
