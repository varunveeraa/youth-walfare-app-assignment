<template>
  <div class="user-management">
    <div class="container">
      <div class="row">
        <div class="col s12">
          <h4>User Management</h4>
          <p class="grey-text">Manage platform users with advanced search and filtering</p>
        </div>
      </div>

      <!-- Search and Filter Controls -->
      <div class="row">
        <div class="col s12 m4">
          <div class="input-field">
            <i class="material-icons prefix">search</i>
            <input
              id="search"
              type="text"
              v-model="searchQuery"
              @input="handleSearch"
              :disabled="loading"
            >
            <label for="search">Search by name or email</label>
          </div>
        </div>

        <div class="col s12 m3">
          <div class="input-field">
            <select v-model="selectedRole" @change="handleRoleFilter" :disabled="loading">
              <option value="">All Roles</option>
              <option value="youth">Youth</option>
              <option value="counsellor">Counsellor</option>
              <option value="admin">Admin</option>
            </select>
            <label>Filter by Role</label>
          </div>
        </div>

        <div class="col s12 m3">
          <div class="input-field">
            <select v-model="pageSize" @change="handlePageSizeChange" :disabled="loading">
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
            <label>Items per page</label>
          </div>
        </div>

        <div class="col s12 m2">
          <button
            @click="exportUsers"
            class="btn waves-effect waves-light blue"
            :disabled="loading"
            style="margin-top: 1rem;"
          >
            <i class="material-icons left">file_download</i>
            Export
          </button>
        </div>
      </div>

      <!-- User Statistics -->
      <div class="row">
        <div class="col s12 m3">
          <div class="card-panel center-align">
            <h5 class="blue-text">{{ totalUsers }}</h5>
            <p>Total Users</p>
          </div>
        </div>
        <div class="col s12 m3">
          <div class="card-panel center-align">
            <h5 class="green-text">{{ activeUsersCount }}</h5>
            <p>Active Users</p>
          </div>
        </div>
        <div class="col s12 m3">
          <div class="card-panel center-align">
            <h5 class="orange-text">{{ counsellorCount }}</h5>
            <p>Counsellors</p>
          </div>
        </div>
        <div class="col s12 m3">
          <div class="card-panel center-align">
            <h5 class="purple-text">{{ youthCount }}</h5>
            <p>Youth Users</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row">
        <div class="col s12 center-align">
          <div class="preloader-wrapper big active">
            <div class="spinner-layer spinner-blue-only">
              <div class="circle-clipper left">
                <div class="circle"></div>
              </div>
              <div class="gap-patch">
                <div class="circle"></div>
              </div>
              <div class="circle-clipper right">
                <div class="circle"></div>
              </div>
            </div>
          </div>
          <p>Loading users...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="row">
        <div class="col s12">
          <div class="card-panel red lighten-4 red-text">
            <i class="material-icons left">error</i>
            Error loading users: {{ error }}
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div v-if="!loading && !error" class="row">
        <div class="col s12">
          <div class="card">
            <div class="card-content">
              <span class="card-title">
                Users ({{ filteredUsers.length }} of {{ totalUsers }})
              </span>

              <!-- Responsive Table -->
              <div class="table-container">
                <table class="striped responsive-table">
                  <thead>
                    <tr>
                      <th>
                        <a @click="sortUsers('displayName')" class="sort-header">
                          Name
                          <i class="material-icons tiny">
                            {{ getSortIcon('displayName') }}
                          </i>
                        </a>
                      </th>
                      <th>
                        <a @click="sortUsers('email')" class="sort-header">
                          Email
                          <i class="material-icons tiny">
                            {{ getSortIcon('email') }}
                          </i>
                        </a>
                      </th>
                      <th>
                        <a @click="sortUsers('role')" class="sort-header">
                          Role
                          <i class="material-icons tiny">
                            {{ getSortIcon('role') }}
                          </i>
                        </a>
                      </th>
                      <th>Status</th>
                      <th>
                        <a @click="sortUsers('createdAt')" class="sort-header">
                          Join Date
                          <i class="material-icons tiny">
                            {{ getSortIcon('createdAt') }}
                          </i>
                        </a>
                      </th>
                      <th>Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in paginatedUsers" :key="user.id">
                      <td>
                        <div class="user-info">
                          <i class="material-icons left">account_circle</i>
                          {{ user.displayName || 'No Name' }}
                        </div>
                      </td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span class="chip" :class="getRoleClass(user.role)">
                          {{ user.role }}
                        </span>
                      </td>
                      <td>
                        <span class="chip" :class="getStatusClass(user.status)">
                          {{ user.status }}
                        </span>
                      </td>
                      <td>{{ formatDate(user.createdAt) }}</td>
                      <td>{{ user.lastActive }}</td>
                      <td>
                        <div class="action-buttons">
                          <button
                            @click="editUser(user)"
                            class="btn-small blue waves-effect waves-light"
                            title="Edit User"
                          >
                            <i class="material-icons">edit</i>
                          </button>
                          <button
                            @click="toggleUserStatus(user)"
                            class="btn-small orange waves-effect waves-light"
                            :title="user.isActive ? 'Deactivate' : 'Activate'"
                          >
                            <i class="material-icons">
                              {{ user.isActive ? 'block' : 'check_circle' }}
                            </i>
                          </button>
                          <button
                            @click="confirmDeleteUser(user)"
                            class="btn-small red waves-effect waves-light"
                            title="Delete User"
                          >
                            <i class="material-icons">delete</i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Empty State -->
                <div v-if="paginatedUsers.length === 0" class="center-align grey-text" style="padding: 2rem;">
                  <i class="material-icons large">people_outline</i>
                  <p>No users found matching your criteria</p>
                </div>
              </div>

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="pagination-wrapper center-align">
                <ul class="pagination">
                  <li :class="{ disabled: currentPage === 1 }">
                    <a @click="goToPage(currentPage - 1)">
                      <i class="material-icons">chevron_left</i>
                    </a>
                  </li>

                  <li
                    v-for="page in visiblePages"
                    :key="page"
                    :class="{ active: page === currentPage }"
                  >
                    <a @click="goToPage(page)">{{ page }}</a>
                  </li>

                  <li :class="{ disabled: currentPage === totalPages }">
                    <a @click="goToPage(currentPage + 1)">
                      <i class="material-icons">chevron_right</i>
                    </a>
                  </li>
                </ul>

                <p class="grey-text">
                  Showing {{ (currentPage - 1) * pageSize + 1 }} to
                  {{ Math.min(currentPage * pageSize, filteredUsers.length) }}
                  of {{ filteredUsers.length }} users
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    <!-- Edit User Modal -->
    <div id="edit-user-modal" class="modal">
      <div class="modal-content">
        <h4>Edit User</h4>
        <div v-if="selectedUser">
          <div class="input-field">
            <input
              id="edit-name"
              type="text"
              v-model="selectedUser.displayName"
            >
            <label for="edit-name" class="active">Display Name</label>
          </div>

          <div class="input-field">
            <select v-model="selectedUser.role">
              <option value="youth">Youth</option>
              <option value="counsellor">Counsellor</option>
              <option value="admin">Admin</option>
            </select>
            <label>Role</label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="saveUserChanges" class="btn blue waves-effect waves-light">
          Save Changes
        </button>
        <button class="modal-close btn-flat waves-effect waves-light">
          Cancel
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="delete-user-modal" class="modal">
      <div class="modal-content">
        <h4>Confirm Delete</h4>
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        <div v-if="userToDelete">
          <p><strong>Name:</strong> {{ userToDelete.displayName }}</p>
          <p><strong>Email:</strong> {{ userToDelete.email }}</p>
          <p><strong>Role:</strong> {{ userToDelete.role }}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="deleteUserConfirmed" class="btn red waves-effect waves-light">
          Delete User
        </button>
        <button class="modal-close btn-flat waves-effect waves-light">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserManagement } from '@/composables/useUserManagement'

const {
  loading,
  error,
  users,
  totalUsers,
  currentPage,
  pageSize,
  searchQuery,
  sortField,
  sortDirection,
  selectedRole,
  totalPages,
  filteredUsers,
  paginatedUsers,
  fetchUsers,
  updateUserRole,
  toggleUserStatus: toggleStatus,
  deleteUser,
  searchUsers,
  filterByRole,
  sortUsers,
  goToPage,
  exportUsers: exportUserData
} = useUserManagement()

// Local state
const selectedUser = ref(null)
const userToDelete = ref(null)

// Computed properties
const activeUsersCount = computed(() =>
  users.value.filter(user => user.status === 'Active').length
)

const counsellorCount = computed(() =>
  users.value.filter(user => user.role === 'counsellor').length
)

const youthCount = computed(() =>
  users.value.filter(user => user.role === 'youth').length
)

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const handleSearch = () => {
  searchUsers(searchQuery.value)
}

const handleRoleFilter = () => {
  filterByRole(selectedRole.value)
}

const handlePageSizeChange = () => {
  currentPage.value = 1
  // Pagination is handled by computed property
}

const getSortIcon = (field) => {
  if (sortField.value !== field) return 'unfold_more'
  return sortDirection.value === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
}

const getRoleClass = (role) => {
  const classes = {
    youth: 'blue lighten-4 blue-text',
    counsellor: 'green lighten-4 green-text',
    admin: 'red lighten-4 red-text'
  }
  return classes[role] || 'grey lighten-4 grey-text'
}

const getStatusClass = (status) => {
  const classes = {
    Active: 'green lighten-4 green-text',
    Inactive: 'orange lighten-4 orange-text',
    Dormant: 'red lighten-4 red-text'
  }
  return classes[status] || 'grey lighten-4 grey-text'
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown'
  const date = new Date(timestamp.seconds * 1000)
  return date.toLocaleDateString()
}

const editUser = (user) => {
  selectedUser.value = { ...user }
  const modal = M.Modal.getInstance(document.getElementById('edit-user-modal'))
  modal.open()
}

const saveUserChanges = async () => {
  if (!selectedUser.value) return

  try {
    const result = await updateUserRole(selectedUser.value.id, selectedUser.value.role)

    if (result.success) {
      M.toast({ html: result.message, classes: 'green' })
      const modal = M.Modal.getInstance(document.getElementById('edit-user-modal'))
      modal.close()
    } else {
      M.toast({ html: result.message, classes: 'red' })
    }
  } catch (err) {
    M.toast({ html: 'Error updating user: ' + err.message, classes: 'red' })
  }
}

const toggleUserStatus = async (user) => {
  try {
    const newStatus = !user.isActive
    const result = await toggleStatus(user.id, newStatus)

    if (result.success) {
      M.toast({
        html: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
        classes: 'green'
      })
    } else {
      M.toast({ html: result.message, classes: 'red' })
    }
  } catch (err) {
    M.toast({ html: 'Error updating user status: ' + err.message, classes: 'red' })
  }
}

const confirmDeleteUser = (user) => {
  userToDelete.value = user
  const modal = M.Modal.getInstance(document.getElementById('delete-user-modal'))
  modal.open()
}

const deleteUserConfirmed = async () => {
  if (!userToDelete.value) return

  try {
    const result = await deleteUser(userToDelete.value.id)

    if (result.success) {
      M.toast({ html: result.message, classes: 'green' })
      const modal = M.Modal.getInstance(document.getElementById('delete-user-modal'))
      modal.close()
      userToDelete.value = null
    } else {
      M.toast({ html: result.message, classes: 'red' })
    }
  } catch (err) {
    M.toast({ html: 'Error deleting user: ' + err.message, classes: 'red' })
  }
}

const exportUsers = () => {
  try {
    const result = exportUserData()
    if (result.success) {
      M.toast({ html: result.message, classes: 'green' })
    } else {
      M.toast({ html: result.message, classes: 'red' })
    }
  } catch (err) {
    M.toast({ html: 'Error exporting users: ' + err.message, classes: 'red' })
  }
}

// Lifecycle
onMounted(async () => {
  // Initialize Materialize components
  if (typeof M !== 'undefined') {
    setTimeout(() => {
      M.FormSelect.init(document.querySelectorAll('select'))
      M.Modal.init(document.querySelectorAll('.modal'))
    }, 100)
  }

  // Fetch initial data
  await fetchUsers()
})
</script>

<style scoped>
.user-management {
  padding: 2rem 0;
}

.sort-header {
  color: #26a69a;
  cursor: pointer;
  display: flex;
  align-items: center;
  text-decoration: none;
}

.sort-header:hover {
  color: #00695c;
}

.material-icons.tiny {
  font-size: 1rem;
  margin-left: 0.25rem;
}

.user-info {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.action-buttons .btn-small {
  padding: 0 0.5rem;
  min-width: auto;
}

.table-container {
  overflow-x: auto;
}

.pagination-wrapper {
  margin-top: 2rem;
}

.chip {
  font-size: 0.8rem;
  height: 24px;
  line-height: 24px;
}

@media only screen and (max-width: 600px) {
  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn-small {
    margin-bottom: 0.25rem;
  }
}
</style>
