<template>
  <!-- SUPER-ADMIN PAGE -->
  <div>
    <HelpSuper />
    <Messages :error="error" :message="message" />

    <b-list-group>
      <b-list-group-item class="flow">
        <h2 class="bg-yellow pl-2 pt-2">
          General
        </h2>
        <div class="mt-2 mb-2">
          <b-btn variant="outline-success" to="/admin/site-pages" class="ml-2">Site pages</b-btn>
        </div>
      </b-list-group-item>
    </b-list-group>

    <b-list-group>
      <b-list-group-item class="flow">
        <h2 class="bg-yellow pl-2 pt-2">
          Publications
          <b-btn @click="addpub()" variant="outline-success" class="mr-2 float-right">Add publication</b-btn>
        </h2>
        <b-container class="p-0">
          <div v-for="(pub, index) in pubs" :key="index">
            <b-row style="border-top:1px solid rgba(0, 0, 0, 0.125);"
                   no-gutters :class="'p-2 '+(pub.owner?'pub-owner':(pub.notowner?'pub-notowner':($auth.user.super?'pub-super':'pub-weird')))">
              <b-col sm="1">
                <b-btn variant="link" @click="togglePubEdit(pub)">
                  <v-icon v-if="pub.superedit" name="minus-square" scale="2" class="btn-outline-warning" />
                  <v-icon v-if="!pub.superedit" name="plus-square" scale="2" class="btn-outline-warning" />
                </b-btn>
              </b-col>
              <b-col sm="3">
                <b-btn variant="outline-primary" :to="'/panel/'+pub.id">
                  {{ pub.name }}
                </b-btn>
              </b-col>
              <b-col sm="6">
                {{ pub.description }}
              </b-col>
              <b-col sm="2">
                <b-badge v-if="!pub.enabled" pill variant="danger">DISABLED</b-badge>
              </b-col>
            </b-row>
            <div v-if="pub.superedit">
              <b-row style="border-bottom:1px solid rgba(0, 0, 0, 0.125);"
                     no-gutters class="p-2">
                <b-col sm="4">
                  <b-btn variant="outline-warning" @click="togglePubEnable(pub)">
                    {{ pub.enabled?'DISABLE':'ENABLE'}}
                  </b-btn>
                </b-col>
                <b-col sm="4">
                  <b-btn variant="outline-danger" @click="duplicatePub(pub)">
                    Duplicate
                  </b-btn>
                </b-col>
                <b-col sm="4">
                  <b-btn variant="outline-danger" @click="deletePub(pub)" class="text-right">
                    DELETE
                  </b-btn>
                </b-col>
              </b-row>

              <b-row style="border-bottom:1px solid rgba(0, 0, 0, 0.125);"
                     no-gutters class="p-2">
                <b-col sm="6">
                  <b-list-group>
                    <b-list-group-item v-for="(superpubrole, index) in pub.superpubroles" :key="index">
                      {{superpubrole.name}} &times; {{superpubrole.users.length}}
                      <ul v-if="superpubrole.isowner" class="mb-0">
                        <li v-for="(user, index2) in superpubrole.users" :key="index2">
                          {{user.username}} - {{user.email}}
                        </li>
                      </ul>
                    </b-list-group-item>
                  </b-list-group>
                </b-col>
                <b-col sm="6">
                  <div v-if="pub.hasanyrole">
                    <b-form @submit.stop.prevent class="ml-5">
                      <b-form-group label="User:" label-cols-sm="2">
                        <b-form-select v-model="pub.adduserid" :options="allusersoptions" class="mr-2"></b-form-select>
                      </b-form-group>
                      <b-form-group label="Role:" label-cols-sm="2">
                        <b-form-select v-model="pub.addroleid" :options="allrolesoptions(pub.id)" class="mr-2"></b-form-select>
                      </b-form-group>
                      <b-form-group label="" label-cols-sm="3">
                        <b-btn variant="outline-success" @click="addPubRole(pub)">
                          Add role
                        </b-btn>
                      </b-form-group>
                    </b-form>
                  </div>
                  <div v-else>
                    No owner role:
                    <b-btn variant="outline-success" @click="addPubRoleOwner(pub)">
                      Add owner role
                    </b-btn>
                  </div>
                </b-col>
              </b-row>
            </div>
          </div>
        </b-container>
      </b-list-group-item>
    </b-list-group>


    <b-modal id="bv-modal-add-pub" size="lg" centered @ok="okAddPub" title="Add publication">
      <form ref="form" @submit.stop.prevent>
        <b-form-group label="Name"
                      label-for="pubname"
                      label-cols-sm="2">
          <b-form-input id="pubname" v-model="pubname" placeholder="Required" required></b-form-input>
        </b-form-group>
        <b-form-group label="Description"
                      label-for="pubdescr"
                      label-cols-sm="2">
          <b-form-textarea id="pubdescr"
                           v-model="pubdescr"
                           rows="3"
                           max-rows="10"
                           style="overflow-y: auto;"
                           placeholder="Required"
                           required>
          </b-form-textarea>
        </b-form-group>
      </form>
    </b-modal>

    <b-modal id="bv-modal-dup-pub" size="lg" centered @ok="okDupPub" title="Duplicate publication">
      <form ref="form" @submit.stop.prevent>
        <ul>
          <li>
            This function will duplicate a publication, ie copy the set up but not copy the submissions.
          </li>
          <li>
            You can choose whether or not to give the current publication users access to the new publication - and copy their roles across.
          </li>
        </ul>
        <b-form-group label="Name"
                      label-for="pubname"
                      label-cols-sm="2">
          <b-form-input id="pubname" v-model="pubname" placeholder="Required" required></b-form-input>
        </b-form-group>
        <b-form-group label="Users"
                      label-for="pubdupusers"
                      label-cols-sm="2">
          <b-form-checkbox id="pubdupusers" v-model="pubdupusers" class="mt-2">
            Give users access and copy roles
          </b-form-checkbox>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script>
  import { page } from '@/utils/page'
  import Messages from '~/components/Messages'
  import HelpSuper from '~/components/HelpSuper'
  import { BBadge } from 'bootstrap-vue'

  const pagetitle = 'Site super admin'
  page.title = pagetitle

  export default {
    middleware: 'authsuper',
    components: { Messages, HelpSuper, BBadge },

    data({ app, params, store }) {
      return {
        error: '',
        message: '',
        pubname: '',
        pubdescr: '',
        pubdupusers: true,
        pubduppubid: 0
      }
    },

    mounted() {
      this.error = ''
      this.message = ''
      this.$store.dispatch('pubs/clearError')
      this.$store.dispatch('pubs/fetch')
      this.$store.dispatch('users/clearError')
      this.$store.dispatch('users/fetchallusers')
      this.$store.commit("page/setTitle", pagetitle)
      document.title = pagetitle
      page.title = pagetitle
    },

    computed: {
      pubs() {
        return this.$store.getters['pubs/get']
      },
      allusersoptions() {
        const allusers = this.$store.getters['users/getall']
        const allusersoptions = []
        for (const user of allusers) {
          allusersoptions.push({ value: user.id, text: user.username + ' - ' + user.email })
        }
        return allusersoptions
      },
      allrolesoptions() {
        return (pubid) => {
          const pubs = this.$store.getters['pubs/get']
          const allrolesoptions = []
          for (const pub of Object.values(pubs)) {
            if (pub.id === pubid) {
              for (const pubrole of pub.pubroles) {
                allrolesoptions.push({ value: pubrole.id, text: pubrole.name })
              }
              break
            }
          }
          return allrolesoptions
        }
      }
    },

    methods: {
      /* ************************ */
      addpub() {
        this.pubname = ''
        this.pubdescr = ''
        this.$bvModal.show('bv-modal-add-pub')
      },
      /* ************************ */
      async okAddPub(bvModalEvt) {
        //console.log('okAddPub', this.pubname, this.pubdescr)
        bvModalEvt.preventDefault()
        try {
          this.pubname = this.pubname.trim()
          this.pubdescr = this.pubdescr.trim()
          if (this.pubname.length === 0) return await this.$bvModal.msgBoxOk('Please give a publication name')
          if (this.pubdescr.length === 0) return await this.$bvModal.msgBoxOk('Please give a publication description')

          const ok = await this.$api.pub.addPub(this.pubname, this.pubdescr)

          if (ok) {
            this.$store.dispatch('pubs/fetch')
            this.$nextTick(() => {
              this.$bvModal.hide('bv-modal-add-pub')
              this.$bvModal.msgBoxOk('Publication added')
            })
          } else {
            await this.$bvModal.msgBoxOk('Add went wrong', { title: 'FAIL', headerBgVariant: 'warning' })
          }
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error adding publication: ' + e.message)
        }
      },
      togglePubEdit(pub) {
        pub.superedit = !pub.superedit
      },
      async togglePubEnable(pub) {
        console.log('togglePubEnable')
        const OK = await this.$bvModal.msgBoxConfirm('Are you sure you want to ' + (pub.enabled ? 'disable' : 'enable') + ' this publication?')
        if (OK) {
          try {
            const ok = await this.$api.pub.toggleEnablePub(pub.id, !pub.enabled)
            if (ok) {
              pub.enabled = !pub.enabled
              this.$store.dispatch('pubs/fetch')
            } else {
              await this.$bvModal.msgBoxOk('Toggling enable went wrong', { title: 'FAIL', headerBgVariant: 'warning' })
            }
          } catch (e) {
            await this.$bvModal.msgBoxOk('Error toggling enable on publication: ' + e.message)
          }
        }
      },
      async deletePub(pub) {
        console.log('deletePub')
        const OK = await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this publication?', { title: 'CHECK THAT ALL TRACES REMOVED', okVariant: 'danger', okTitle: 'YES', cancelTitle: 'NO',})
        if (OK) {
          try {
            const ok = await this.$api.pub.deletePub(pub.id)
            if (ok) {
              this.$store.dispatch('pubs/fetch')
              this.$nextTick(() => {
                this.$bvModal.msgBoxOk('Publication deleted')
              })
            } else {
              await this.$bvModal.msgBoxOk('Delete went wrong', { title: 'FAIL', headerBgVariant: 'warning' })
            }
          } catch (e) {
            await this.$bvModal.msgBoxOk('Error deleting publication: ' + e.message)
          }
        }
      },
      async addPubRoleOwner(pub) {
        try {
          const ok = await this.$api.pub.addPubRoleOwner(pub.id)
          if (ok) {
            this.$store.dispatch('pubs/fetch')
          } else {
            await this.$bvModal.msgBoxOk('Add owner role went wrong', { title: 'FAIL', headerBgVariant: 'warning' })
          }
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error adding owner role: ' + e.message)
        }
      },
      async addPubRole(pub) {
        try {
          if (pub.adduserid === 0) return await this.$bvModal.msgBoxOk('Please select a user to add')
          if (pub.addroleid === 0) return await this.$bvModal.msgBoxOk('Please select a role to add')
          const ok = await this.$api.pub.addPubRole(pub.id, pub.adduserid, pub.addroleid)
          if (ok) {
            this.$store.dispatch('pubs/fetch')
          } else {
            await this.$bvModal.msgBoxOk('Add owner went wrong', { title: 'FAIL', headerBgVariant: 'warning' })
          }
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error adding owner: ' + e.message)
        }
      },
      duplicatePub(pub) {
        this.pubname = pub.name+' COPY'
        this.pubdupusers = true
        this.pubduppubid = pub.id
        this.$bvModal.show('bv-modal-dup-pub')
      },
      async okDupPub(bvModalEvt) {
        bvModalEvt.preventDefault()
        try {
          this.pubname = this.pubname.trim()
          if (this.pubname.length === 0) return await this.$bvModal.msgBoxOk('Please give a publication name')

          const ok = await this.$api.pub.duplicatePub(this.pubduppubid, this.pubname, this.pubdupusers)

          if (ok) {
            this.$store.dispatch('pubs/fetch')
            this.$nextTick(() => {
              this.$bvModal.hide('bv-modal-dup-pub')
              this.$bvModal.msgBoxOk('Publication duplicated')
            })
          } else {
            await this.$bvModal.msgBoxOk('Duplicate went wrong', { title: 'FAIL', headerBgVariant: 'warning' })
          }
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error duplicating publication: ' + e.message)
        }
      }
    },

    head() {
      return {
        title: pagetitle
      }
    }
  }
</script>

