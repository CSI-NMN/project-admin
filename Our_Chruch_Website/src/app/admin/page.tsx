'use client'

import './admin.css'
import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addAdmin, removeAdmin, updateAdminRole } from '@/store/slices/adminSlice'
import { AdminRecord, AdminRole } from '@/types/admin'
import { Family, Person } from '@/types/records'
import { recordsService } from '@/store/api/recordsApi'
import AdminListSection from '@/components/admin/AdminListSection'
import AdminFormSection from '@/components/admin/AdminFormSection'
import ConfirmAdminModal from '@/components/admin/ConfirmAdminModal'
import RemoveAdminModal from '@/components/admin/RemoveAdminModal'
import EditAdminRoleModal from '@/components/admin/EditAdminRoleModal'

const ROLE_OPTIONS: { value: AdminRole; description: string }[] = [
  {
    value: 'Church Admin',
    description: 'Full church-level admin access for records and administrative actions.',
  },
  {
    value: 'Chairman',
    description: 'Leadership access for reviewing and overseeing church administration.',
  },
  {
    value: 'Secretary',
    description: 'Access for coordinating member administration and communication records.',
  },
  {
    value: 'Treasurer',
    description: 'Access for finance-related review and treasury administration duties.',
  },
]

export default function AdminPage() {
  const dispatch = useAppDispatch()
  const admins = useAppSelector(state => state.admin.admins)
  const [families, setFamilies] = useState<Family[]>([])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [selectedRole, setSelectedRole] = useState<AdminRole | ''>('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [editCandidate, setEditCandidate] = useState<AdminRecord | null>(null)
  const [editRole, setEditRole] = useState<AdminRole | ''>('')
  const [removeCandidate, setRemoveCandidate] = useState<AdminRecord | null>(null)

  useEffect(() => {
    let active = true

    recordsService
      .listFamilies({
        $top: 1000,
        $skip: 0,
      })
      .then(data => {
        if (!active) return
        setFamilies(data)
      })
      .catch(() => {
        if (!active) return
        setFamilies([])
      })

    return () => {
      active = false
    }
  }, [])

  const allPeople = useMemo(() => families.flatMap(family => family.members), [families])
  const assignedPersonIds = useMemo(() => new Set(admins.map(admin => admin.personId)), [admins])

  const candidateResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (!normalizedQuery) return []

    return allPeople
      .filter(person => !assignedPersonIds.has(person.id))
      .filter(person => {
        const fullName = `${person.firstName} ${person.lastName}`.toLowerCase()
        return (
          fullName.includes(normalizedQuery) ||
          (person.memberNo || '').toLowerCase().includes(normalizedQuery) ||
          (person.mobileNo || '').toLowerCase().includes(normalizedQuery) ||
          (person.email || '').toLowerCase().includes(normalizedQuery)
        )
      })
      .slice(0, 8)
  }, [allPeople, assignedPersonIds, searchQuery])

  const resetCreateState = () => {
    setSearchQuery('')
    setSelectedPerson(null)
    setSelectedRole('')
    setShowConfirmModal(false)
  }

  const handleOpenCreate = () => {
    resetCreateState()
    setShowCreateForm(true)
  }

  const handleBackToAdminList = () => {
    resetCreateState()
    setShowCreateForm(false)
  }

  const handleConfirmAddAdmin = () => {
    if (!selectedPerson || !selectedRole) return

    dispatch(
      addAdmin({
        id: `admin-${Date.now()}`,
        personId: selectedPerson.id,
        memberId: selectedPerson.memberNo || '',
        name: `${selectedPerson.firstName} ${selectedPerson.lastName}`,
        email: selectedPerson.email || '',
        role: selectedRole,
      })
    )

    handleBackToAdminList()
  }

  const handleConfirmRemoveAdmin = () => {
    if (!removeCandidate) return
    dispatch(removeAdmin({ adminId: removeCandidate.id }))
    setRemoveCandidate(null)
  }

  const handleOpenEditRole = (admin: AdminRecord) => {
    setEditCandidate(admin)
    setEditRole(admin.role)
  }

  const handleConfirmEditRole = () => {
    if (!editCandidate || !editRole) return
    dispatch(updateAdminRole({ adminId: editCandidate.id, role: editRole }))
    setEditCandidate(null)
    setEditRole('')
  }

  return (
    <div className="app-page">
      <div className="app-shell">
        {!showCreateForm ? (
          <AdminListSection
            admins={admins}
            onCreateNew={handleOpenCreate}
            onEditRequest={handleOpenEditRole}
            onRemoveRequest={setRemoveCandidate}
          />
        ) : (
          <AdminFormSection
            searchQuery={searchQuery}
            candidateResults={candidateResults}
            selectedPerson={selectedPerson}
            selectedRole={selectedRole}
            roleOptions={ROLE_OPTIONS}
            onBack={handleBackToAdminList}
            onSearchChange={setSearchQuery}
            onSelectPerson={person => {
              setSelectedPerson(person)
              setSearchQuery('')
            }}
            onClearPerson={() => setSelectedPerson(null)}
            onRoleSelect={setSelectedRole}
            onSubmit={() => setShowConfirmModal(true)}
          />
        )}
      </div>

      <ConfirmAdminModal
        show={showConfirmModal}
        person={selectedPerson}
        role={selectedRole}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAddAdmin}
      />

      <RemoveAdminModal
        admin={removeCandidate}
        onCancel={() => setRemoveCandidate(null)}
        onConfirm={handleConfirmRemoveAdmin}
      />

      <EditAdminRoleModal
        admin={editCandidate}
        selectedRole={editRole}
        roleOptions={ROLE_OPTIONS}
        onRoleSelect={setEditRole}
        onCancel={() => {
          setEditCandidate(null)
          setEditRole('')
        }}
        onConfirm={handleConfirmEditRole}
      />
    </div>
  )
}

