/**
 * 👥 Team Page
 *
 * Gestion de l'équipe et des membres
 */

import React, { useState, useMemo } from 'react';
import { useAuth, useData } from '@/core/contexts';
import { Card, Button, Input, Select, Modal } from '@/shared/components';
import { formatDate } from '@/core/utils/formatters';

export const TeamPage = () => {
  const { user } = useAuth();
  const { team } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Filter team members
  const filteredTeam = useMemo(() => {
    let result = [...team];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(member =>
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(search) ||
        member.email?.toLowerCase().includes(search) ||
        member.department?.toLowerCase().includes(search)
      );
    }

    if (roleFilter) {
      result = result.filter(member => member.role === roleFilter);
    }

    return result;
  }, [team, searchTerm, roleFilter]);

  // Group by department
  const teamByDepartment = useMemo(() => {
    const grouped = {};
    filteredTeam.forEach(member => {
      const dept = member.department || 'Non assigné';
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(member);
    });
    return grouped;
  }, [filteredTeam]);

  const roleOptions = [
    { value: '', label: 'Tous les rôles' },
    { value: 'admin', label: 'Admin' },
    { value: 'recruiter', label: 'Recruteur' },
    { value: 'manager', label: 'Manager' },
    { value: 'viewer', label: 'Lecture seule' }
  ];

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      recruiter: 'bg-blue-100 text-blue-800',
      manager: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.viewer;
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrateur',
      recruiter: 'Recruteur',
      manager: 'Manager',
      viewer: 'Lecture seule'
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👥 Équipe
          </h1>
          <p className="text-gray-600">
            {filteredTeam.length} membre{filteredTeam.length > 1 ? 's' : ''}
            {team.length !== filteredTeam.length && ` (sur ${team.length} au total)`}
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button
            onClick={() => setShowInviteModal(true)}
            icon="➕"
          >
            Inviter un membre
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Rechercher un membre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
          />
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={roleOptions}
          />
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{team.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total membres</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {team.filter(m => m.role === 'admin').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Administrateurs</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {team.filter(m => m.role === 'recruiter').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Recruteurs</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600">
            {Object.keys(teamByDepartment).length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Départements</div>
        </Card>
      </div>

      {/* Team Members Grid */}
      {filteredTeam.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun membre trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              {team.length === 0
                ? 'Commencez par inviter des membres dans votre équipe'
                : 'Aucun membre ne correspond à vos critères de recherche'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(teamByDepartment).map(([department, members]) => (
            <div key={department}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                📁 {department}
                <span className="text-sm font-normal text-gray-500">
                  ({members.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {members.map((member) => (
                  <Card
                    key={member._id || member.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {member.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                            {getRoleLabel(member.role)}
                          </span>
                          {member._id === user?._id && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Vous
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <Modal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          title="Détails du membre"
        >
          <div className="space-y-6">
            {/* Header with Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-3xl">
                {selectedMember.firstName?.[0]}{selectedMember.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedMember.firstName} {selectedMember.lastName}
                </h2>
                <p className="text-gray-600">{selectedMember.email}</p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(selectedMember.role)}`}>
                  {getRoleLabel(selectedMember.role)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Département
                </label>
                <p className="text-gray-900">{selectedMember.department || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <p className="text-gray-900">{selectedMember.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membre depuis
                </label>
                <p className="text-gray-900">
                  {formatDate(selectedMember.createdAt || selectedMember.joinedAt, 'long')}
                </p>
              </div>
            </div>

            {/* Actions */}
            {user?.role === 'admin' && selectedMember._id !== user._id && (
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="secondary" size="sm">
                  Modifier le rôle
                </Button>
                <Button variant="danger" size="sm">
                  Retirer de l'équipe
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title="Inviter un membre"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Invitez un nouveau membre à rejoindre votre équipe. Ils recevront un email avec un lien d'inscription.
            </p>
            <Input
              label="Email"
              type="email"
              placeholder="membre@exemple.com"
            />
            <Select
              label="Rôle"
              options={roleOptions.filter(r => r.value)}
            />
            <Select
              label="Département"
              options={[
                { value: 'Recrutement', label: 'Recrutement' },
                { value: 'RH', label: 'RH' },
                { value: 'Commercial', label: 'Commercial' },
                { value: 'Direction', label: 'Direction' }
              ]}
            />
            <div className="flex gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
                Annuler
              </Button>
              <Button onClick={() => setShowInviteModal(false)}>
                Envoyer l'invitation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
