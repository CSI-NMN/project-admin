import { Family, Person } from '@/types/family'

interface FamilyCardViewProps {
  family: Family
  selectedPerson: Person | null
  onBack: () => void
}

export default function FamilyCardView({ family, selectedPerson, onBack }: FamilyCardViewProps) {
  if (!selectedPerson) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-amber-600 hover:text-amber-700 font-medium mb-6 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Family
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-lg border-2 border-amber-600 shadow-lg overflow-hidden">
          {/* Card Header - Person Name and Title */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">
              {selectedPerson.first_name} {selectedPerson.last_name}
            </h1>
            <p className="text-amber-100 font-semibold">{selectedPerson.relationship_type}</p>
            {selectedPerson.is_head && (
              <span className="inline-block mt-2 bg-yellow-300 text-amber-900 px-3 py-1 rounded-full text-sm font-semibold">
                Family Head
              </span>
            )}
          </div>

          {/* Card Content */}
          <div className="p-8">
            {/* Family Information */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-amber-600">👨‍👩‍👧‍👦</span> Family Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Family Code</p>
                  <p className="text-gray-900 font-semibold text-lg">{family.family_code}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Family Name</p>
                  <p className="text-gray-900 font-semibold text-lg">{family.family_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Area</p>
                  <p className="text-gray-900 font-semibold text-lg">{family.area || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Members</p>
                  <p className="text-gray-900 font-semibold text-lg">{family.members.length}</p>
                </div>
              </div>
            </div>

            {/* Subscription Card Details */}
            <div className="mb-8 pb-8 border-b border-gray-200 bg-amber-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-amber-600">🎫</span> Subscription Card Details
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Card Number</p>
                  <p className="text-gray-900 font-mono font-bold text-lg">{selectedPerson.subscriptionCardNo}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Card Holder</p>
                  <p className="text-gray-900 font-semibold text-lg">
                    {selectedPerson.first_name} {selectedPerson.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Issued Date</p>
                  <p className="text-gray-900 font-semibold text-lg">{family.created_at.split('T')[0]}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Status</p>
                  <p className="text-green-600 font-semibold text-lg">✓ Active</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-amber-600">👤</span> Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">First Name</p>
                  <p className="text-gray-900 font-semibold">{selectedPerson.first_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Last Name</p>
                  <p className="text-gray-900 font-semibold">{selectedPerson.last_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Father&apos;s Name</p>
                  <p className="text-gray-900 font-semibold">{selectedPerson.father_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Mother&apos;s Name</p>
                  <p className="text-gray-900 font-semibold">{selectedPerson.mother_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Date of Birth</p>
                  <p className="text-gray-900 font-semibold">{selectedPerson.date_of_birth || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Gender</p>
                  <p className="text-gray-900 font-semibold">{selectedPerson.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Blood Group</p>
                  <p className="text-gray-900 font-semibold text-lg font-mono">{selectedPerson.blood_group || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Marital Status</p>
                  <p className="text-gray-900 font-semibold">{selectedPerson.marital_status || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Religious Information */}
            <div className="mb-8 pb-8 border-b border-gray-200 bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">✝️</span> Religious Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Date of Baptism</p>
                  <p className="text-gray-900 font-semibold">{selectedPerson.date_of_baptism || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Date of Confirmation</p>
                  <p className="text-gray-900 font-semibold">{selectedPerson.date_of_confirmation || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 text-sm font-semibold">Date of Marriage</p>
                  <p className="text-gray-900 font-semibold">{selectedPerson.date_of_marriage || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-amber-600">📞</span> Contact Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Mobile Number</p>
                  <p className="text-gray-900 font-semibold">{selectedPerson.mobile_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Email</p>
                  <p className="text-gray-900 font-semibold break-words">{selectedPerson.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-amber-600">💼</span> Professional Information
              </h2>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Profession</p>
                <p className="text-gray-900 font-semibold">{selectedPerson.profession || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
            <span>Card ID: {selectedPerson.id}</span>
            <span>Updated: {family.updated_at.split('T')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
