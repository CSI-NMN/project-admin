'use client'

import { useEffect, useState } from 'react'
import { Family, Person } from '@/types/records'

interface RecordsFormProps {
  initialData?: Partial<Person>
  isNew: boolean
  families: Family[]
  onSubmit: (data: Partial<Person>) => void
  onCancel: () => void
  hideFamily?: boolean
  forceHeadSelection?: boolean
}

const getInitialState = (initialData?: Partial<Person>): Partial<Person> => ({
  firstName: '',
  lastName: '',
  relationshipType: 'Child',
  isHead: false,
  createSubscription: false,
  subscriptionName: '',
  familyId: '',
  ...initialData,
})

export default function RecordsForm({
  initialData,
  isNew,
  families,
  onSubmit,
  onCancel,
  hideFamily = false,
  forceHeadSelection = false,
}: RecordsFormProps) {
  const [formData, setFormData] = useState<Partial<Person>>(getInitialState(initialData))

  const handleChange = (field: keyof Person, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const state = getInitialState(initialData)

    if (forceHeadSelection) {
      state.isHead = true
      state.relationshipType = 'Head'
    }

    setFormData(state)
  }, [initialData, forceHeadSelection])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { id, createdAt, updatedAt, membershipName, ...payload } = formData
    void id
    void createdAt
    void updatedAt
    void membershipName

    if (!isNew) {
      delete payload.createSubscription
      delete payload.subscriptionName
    }

    if (isNew && payload.createSubscription && !payload.subscriptionName) {
      payload.subscriptionName = payload.firstName || ''
    }

    if (forceHeadSelection) {
      payload.isHead = true
      payload.relationshipType = 'Head'
    }

    if (isNew) {
      onSubmit(payload)
      return
    }

    const changedPayload: Partial<Person> = {}
    const base = initialData || {}
    const fields = Object.keys(payload) as (keyof Person)[]

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
        {isNew ? 'Create New Person Record' : 'Edit Person Record'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="app-form-grid">
          <div>
            <label className="app-label">First Name</label>
            <input
              type="text"
              value={formData.firstName || ''}
              onChange={e => handleChange('firstName', e.target.value)}
              className="app-input"
              required
            />
          </div>
          <div>
            <label className="app-label">Last Name</label>
            <input
              type="text"
              value={formData.lastName || ''}
              onChange={e => handleChange('lastName', e.target.value)}
              className="app-input"
              required
            />
          </div>
          <div>
            <label className="app-label">{isNew ? 'Add new Subscription' : 'Subscription'}</label>
            {isNew ? (
              <div className="space-y-3 pt-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="createSubscription"
                    checked={Boolean(formData.createSubscription)}
                    onChange={() =>
                      setFormData(prev => ({
                        ...prev,
                        createSubscription: true,
                      }))
                    }
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="createSubscription"
                    checked={!formData.createSubscription}
                    onChange={() =>
                      setFormData(prev => ({
                        ...prev,
                        createSubscription: false,
                        subscriptionName: '',
                      }))
                    }
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
            ) : (
              <div className="pt-2">
                <p className="text-sm text-gray-900">
                  {formData.membershipName || formData.memberNo || 'No subscription linked'}
                </p>
                {formData.membershipName && formData.memberNo && (
                  <p className="text-xs text-gray-500 mt-1">{formData.memberNo}</p>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="app-label">Relationship Type</label>
            <select
              value={formData.relationshipType || ''}
              onChange={e => handleChange('relationshipType', e.target.value)}
              className="app-input"
              disabled={forceHeadSelection}
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
              value={formData.maritalStatus || ''}
              onChange={e => handleChange('maritalStatus', e.target.value)}
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
              value={formData.dateOfBirth || ''}
              onChange={e => handleChange('dateOfBirth', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Mobile No</label>
            <input
              type="tel"
              value={formData.mobileNo || ''}
              onChange={e => handleChange('mobileNo', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Aadhaar Number</label>
            <input
              type="text"
              value={formData.aadhaarNumber || ''}
              onChange={e => handleChange('aadhaarNumber', e.target.value)}
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
              value={formData.bloodGroup || ''}
              onChange={e => handleChange('bloodGroup', e.target.value)}
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
            <label className="app-label">Date of Baptism</label>
            <input
              type="date"
              value={formData.dateOfBaptism || ''}
              onChange={e => handleChange('dateOfBaptism', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Date of Confirmation</label>
            <input
              type="date"
              value={formData.dateOfConfirmation || ''}
              onChange={e => handleChange('dateOfConfirmation', e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="app-label">Date of Marriage</label>
            <input
              type="date"
              value={formData.dateOfMarriage || ''}
              onChange={e => handleChange('dateOfMarriage', e.target.value)}
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
                    {family.familyName}
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

