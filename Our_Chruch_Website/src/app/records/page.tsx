'use client'

import { useState } from 'react'
import FamilyCardView from '../../components/FamilyCardView'
import Navbar from '../../components/Navbar'

// Types
interface Family {
  id: string
  family_code: string
  family_name: string
  residential_address?: string
  office_address?: string
  area?: string
  created_at: string
  updated_at: string
  members: Person[]
}

interface Person {
  id: string
  subscriptionCardNo: string
  first_name: string
  last_name: string
  father_name?: string
  mother_name?: string
  gender?: string
  marital_status?: string
  date_of_birth?: string
  date_of_baptism?: string
  date_of_confirmation?: string
  date_of_marriage?: string
  blood_group?: string
  profession?: string
  mobile_no?: string
  email?: string
  relationship_type: string
  is_head: boolean
  familyId: string // For linking to family
}

// Mock data
const mockFamilies: Family[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    family_code: 'FAM001',
    family_name: 'Doe Family',
    residential_address: '123 Main St, Springfield',
    office_address: '456 Business Ave, Springfield',
    area: 'Downtown',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-03-09T14:30:00Z',
    members: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        subscriptionCardNo: '5341930004628032',
        first_name: 'John',
        last_name: 'Doe',
        father_name: 'Robert Doe',
        mother_name: 'Mary Doe',
        gender: 'Male',
        marital_status: 'Married',
        date_of_birth: '1980-05-15',
        date_of_baptism: '1980-06-20',
        date_of_confirmation: '1995-06-20',
        date_of_marriage: '2005-08-10',
        blood_group: 'O+',
        profession: 'Engineer',
        mobile_no: '123-456-7890',
        email: 'john.doe@example.com',
        relationship_type: 'Head',
        is_head: true,
        familyId: '550e8400-e29b-41d4-a716-446655440000'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        subscriptionCardNo: '6342030005628033',
        first_name: 'Jane',
        last_name: 'Doe',
        father_name: 'William Smith',
        mother_name: 'Elizabeth Smith',
        gender: 'Female',
        marital_status: 'Married',
        date_of_birth: '1982-03-22',
        date_of_baptism: '1982-04-15',
        date_of_confirmation: '1997-04-15',
        date_of_marriage: '2005-08-10',
        blood_group: 'A+',
        profession: 'Teacher',
        mobile_no: '123-456-7891',
        email: 'jane.doe@example.com',
        relationship_type: 'Spouse',
        is_head: false,
        familyId: '550e8400-e29b-41d4-a716-446655440000'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        subscriptionCardNo: '7343130006628034',
        first_name: 'Jimmy',
        last_name: 'Doe',
        father_name: 'John Doe',
        mother_name: 'Jane Doe',
        gender: 'Male',
        marital_status: 'Single',
        date_of_birth: '2010-11-08',
        date_of_baptism: '2010-12-15',
        date_of_confirmation: '2025-12-15',
        blood_group: 'O-',
        profession: 'Student',
        mobile_no: '123-456-7892',
        email: 'jimmy.doe@example.com',
        relationship_type: 'Child',
        is_head: false,
        familyId: '550e8400-e29b-41d4-a716-446655440000'
      }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    family_code: 'FAM002',
    family_name: 'McPhee Family',
    residential_address: '789 Oak St, Springfield',
    office_address: '321 Corporate Blvd, Springfield',
    area: 'Suburb',
    created_at: '2024-02-20T09:15:00Z',
    updated_at: '2024-03-08T16:45:00Z',
    members: [
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        subscriptionCardNo: '5341930004628032',
        first_name: 'Jennie',
        last_name: 'McPhee',
        father_name: 'David McPhee',
        mother_name: 'Sarah McPhee',
        gender: 'Female',
        marital_status: 'Single',
        date_of_birth: '1990-07-12',
        date_of_baptism: '1990-08-20',
        date_of_confirmation: '2005-08-20',
        blood_group: 'B+',
        profession: 'Doctor',
        mobile_no: '123-456-7893',
        email: 'jennie@example.com',
        relationship_type: 'Head',
        is_head: true,
        familyId: '550e8400-e29b-41d4-a716-446655440004'
      }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    family_code: 'FAM003',
    family_name: 'Ottomon Family',
    residential_address: '456 Pine St, Springfield',
    office_address: '654 Tech Park, Springfield',
    area: 'Uptown',
    created_at: '2024-01-30T11:30:00Z',
    updated_at: '2024-03-07T13:20:00Z',
    members: [
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        subscriptionCardNo: '6343200059628036',
        first_name: 'Jenny',
        last_name: 'Ottomon',
        father_name: 'Michael Ottomon',
        mother_name: 'Lisa Ottomon',
        gender: 'Female',
        marital_status: 'Married',
        date_of_birth: '1985-09-18',
        date_of_baptism: '1985-10-25',
        date_of_confirmation: '2000-10-25',
        date_of_marriage: '2010-06-15',
        blood_group: 'AB+',
        profession: 'Lawyer',
        mobile_no: '123-456-7894',
        email: 'jenny.o@example.com',
        relationship_type: 'Head',
        is_head: true,
        familyId: '550e8400-e29b-41d4-a716-446655440006'
      }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    family_code: 'FAM004',
    family_name: 'Slater Family',
    residential_address: '987 Elm St, Springfield',
    office_address: '147 Finance St, Springfield',
    area: 'Business District',
    created_at: '2024-03-01T08:45:00Z',
    updated_at: '2024-03-09T10:15:00Z',
    members: [
      {
        id: '550e8400-e29b-41d4-a716-446655440009',
        subscriptionCardNo: '6289160004624199',
        first_name: 'Jenny',
        last_name: 'Slater',
        father_name: 'Thomas Slater',
        mother_name: 'Anna Slater',
        gender: 'Female',
        marital_status: 'Divorced',
        date_of_birth: '1978-12-03',
        date_of_baptism: '1979-01-10',
        date_of_confirmation: '1994-01-10',
        date_of_marriage: '2000-04-20',
        blood_group: 'A-',
        profession: 'Accountant',
        mobile_no: '123-456-7895',
        email: 'jenny.s@example.com',
        relationship_type: 'Head',
        is_head: true,
        familyId: '550e8400-e29b-41d4-a716-446655440008'
      }
    ]
  }
]

export default function AdminRecordsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Person[]>([])
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [showTable, setShowTable] = useState(false)
  const [viewingPersonCard, setViewingPersonCard] = useState<Person | null>(null)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newPerson, setNewPerson] = useState<Partial<Person>>({})

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.trim()) {
      const results = mockFamilies
        .flatMap(f => f.members)
        .filter(p =>
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(query.toLowerCase()) ||
          p.subscriptionCardNo === query
        )
      
      setSearchResults(results)
      setSelectedFamily(null)
      setShowTable(false)
    } else {
      setSearchResults([])
      setSelectedFamily(null)
      setShowTable(false)
    }
  }

  const handleSelectRecord = (person: Person) => {
    const family = mockFamilies.find(f => f.id === person.familyId)
    setSelectedFamily(family || null)
    setShowTable(true)
  }

  const handleCreateNewRecord = () => {
    setIsCreatingNew(true)
    setNewPerson({
      id: '',
      subscriptionCardNo: '',
      first_name: '',
      last_name: '',
      relationship_type: 'Child',
      is_head: false,
      familyId: ''
    })
  }

  const handleEditPerson = (personId: string) => {
    const person = selectedFamily?.members.find(p => p.id === personId)
    if (person) {
      setEditingPerson(person)
    }
  }

  const handleEditHierarchy = () => {
    alert('Edit family hierarchy functionality to be implemented')
  }

  const handleAddNewUser = () => {
    setIsCreatingNew(true)
    setNewPerson({
      id: '',
      subscriptionCardNo: '',
      first_name: '',
      last_name: '',
      relationship_type: 'Child',
      is_head: false,
      familyId: selectedFamily?.id || ''
    })
  }

  const handleBackToResults = () => {
    setShowTable(false)
    setSelectedFamily(null)
    setEditingPerson(null)
    setIsCreatingNew(false)
  }

  const handleSavePerson = (person: Person) => {
    // In a real app, this would save to backend
    alert('Person saved successfully!')
    setEditingPerson(null)
    setIsCreatingNew(false)
  }

  const handleCancelEdit = () => {
    setEditingPerson(null)
    setIsCreatingNew(false)
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {!showTable ? (
          <>
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Records</h1>
                <p className="text-gray-600 text-sm">View and manage records of all family members and veteran discount cards</p>
              </div>
              <button
                onClick={handleCreateNewRecord}
                className="bg-white border-2 border-gray-400 text-gray-700 px-6 py-2 rounded font-medium hover:bg-gray-50 transition-colors"
              >
                + Create new record
              </button>
            </div>

            {/* Search Section */}
            <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Find an existing record</h2>
              <p className="text-gray-600 text-sm mb-4">To view a record, enter a colleague or veteran&apos;s name, subscription ID, or colleague number.</p>
              
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full border-2 border-amber-600 rounded px-12 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-700"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                      setSelectedFamily(null)
                      setShowTable(false)
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                )}
              </div>

              {searchQuery && searchResults.length > 0 && (
                <p className="text-gray-600 text-sm mt-4 font-medium">We found {searchResults.length} matching record{searchResults.length !== 1 ? 's' : ''}.</p>
              )}

              {searchQuery && searchResults.length === 0 && (
                <p className="text-gray-600 text-sm mt-4">We found 0 matching records. Try searching for a different record.</p>
              )}
            </div>

            {/* Search Results List */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => handleSelectRecord(person)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-amber-50 hover:border-amber-300 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-amber-700">
                        {person.first_name} {person.last_name}, {person.subscriptionCardNo}
                      </h3>
                      <p className="text-sm text-gray-600">Family: {mockFamilies.find(f => f.id === person.familyId)?.family_name}</p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-amber-600 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Back Button */}
            <button
              onClick={handleBackToResults}
              className="text-amber-600 hover:text-amber-700 font-medium mb-6 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Results
            </button>

            {/* Edit Form */}
            {(editingPerson || isCreatingNew) ? (
              <PersonEditForm
                person={editingPerson || newPerson as Person}
                isNew={isCreatingNew}
                onSave={handleSavePerson}
                onCancel={handleCancelEdit}
                families={mockFamilies}
              />
            ) : (
              /* Table Results */
              selectedFamily && (
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                  {/* Family Details Section */}
                  <div className="px-6 py-6 bg-white border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Family Details</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-gray-600 text-sm font-semibold">Family Code (Unique)</p>
                        <p className="text-gray-900 font-semibold text-lg">{selectedFamily.family_code}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold">Family Name</p>
                        <p className="text-gray-900 font-semibold text-lg">{selectedFamily.family_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold">Area</p>
                        <p className="text-gray-900 font-semibold text-lg">{selectedFamily.area || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold">Residential Address</p>
                        <p className="text-gray-900 font-semibold">{selectedFamily.residential_address || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold">Office Address</p>
                        <p className="text-gray-900 font-semibold">{selectedFamily.office_address || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold">Family Head Name</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {selectedFamily.members.find(m => m.is_head)?.first_name} {selectedFamily.members.find(m => m.is_head)?.last_name}
                        </p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-gray-600 text-sm font-semibold">Head Phone Number</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {selectedFamily.members.find(m => m.is_head)?.mobile_no || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Edit Hierarchy Button */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-white">
                    <button
                      onClick={handleEditHierarchy}
                      className="bg-amber-600 text-white px-4 py-2 rounded font-medium hover:bg-amber-700 transition-colors"
                    >
                      Edit Family Hierarchy
                    </button>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subscription Card</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Relationship</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mobile</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedFamily.members.map((person, index) => (
                          <tr
                            key={person.id}
                            className={`border-b border-gray-200 hover:bg-amber-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{person.first_name} {person.last_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{person.subscriptionCardNo}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{person.relationship_type}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{person.mobile_no}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{person.email}</td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => handleEditPerson(person.id)}
                                className="text-amber-600 hover:text-amber-700 font-medium transition-colors inline-flex items-center gap-2"
                              >
                                <span>✎</span> Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add New User Button */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={handleAddNewUser}
                      className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                      + Add new user at bottom of family
                    </button>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Person Edit Form Component
interface PersonEditFormProps {
  person: Person
  isNew: boolean
  onSave: (person: Person) => void
  onCancel: () => void
  families: Family[]
}

function PersonEditForm({ person, isNew, onSave, onCancel, families }: PersonEditFormProps) {
  const [formData, setFormData] = useState<Partial<Person>>(person)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData as Person)
  }

  const handleChange = (field: keyof Person, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {isNew ? 'Create New Person' : 'Edit Person'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={formData.first_name || ''}
              onChange={(e) => handleChange('first_name', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={formData.last_name || ''}
              onChange={(e) => handleChange('last_name', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subscription Card No</label>
            <input
              type="text"
              value={formData.subscriptionCardNo || ''}
              onChange={(e) => handleChange('subscriptionCardNo', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship Type</label>
            <select
              value={formData.relationship_type || ''}
              onChange={(e) => handleChange('relationship_type', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="Head">Head</option>
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
            <select
              value={formData.gender || ''}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Marital Status</label>
            <select
              value={formData.marital_status || ''}
              onChange={(e) => handleChange('marital_status', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              value={formData.date_of_birth || ''}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile No</label>
            <input
              type="tel"
              value={formData.mobile_no || ''}
              onChange={(e) => handleChange('mobile_no', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Profession</label>
            <input
              type="text"
              value={formData.profession || ''}
              onChange={(e) => handleChange('profession', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
            <select
              value={formData.blood_group || ''}
              onChange={(e) => handleChange('blood_group', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Father Name</label>
            <input
              type="text"
              value={formData.father_name || ''}
              onChange={(e) => handleChange('father_name', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mother Name</label>
            <input
              type="text"
              value={formData.mother_name || ''}
              onChange={(e) => handleChange('mother_name', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Baptism</label>
            <input
              type="date"
              value={formData.date_of_baptism || ''}
              onChange={(e) => handleChange('date_of_baptism', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Confirmation</label>
            <input
              type="date"
              value={formData.date_of_confirmation || ''}
              onChange={(e) => handleChange('date_of_confirmation', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Marriage</label>
            <input
              type="date"
              value={formData.date_of_marriage || ''}
              onChange={(e) => handleChange('date_of_marriage', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          {isNew && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Family</label>
              <select
                value={formData.familyId || ''}
                onChange={(e) => handleChange('familyId', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                required
              >
                <option value="">Select Family</option>
                {families.map(family => (
                  <option key={family.id} value={family.id}>{family.family_name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
          >
            {isNew ? 'Create Person' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}


 