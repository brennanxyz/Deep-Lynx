<template>
    <div v-if="container">
      <error-banner :message="errorMessage"></error-banner>
      <v-navigation-drawer
            v-model="drawer"
            app
            class="grey--text text--darken-2 d-flex"
        >
            <div class="mt-4">
                <v-avatar tile height="25" width="25" class="mt-n1">
                    <img src="../assets/data-orange.png">
                </v-avatar>
                <h1 class="text-h1 d-inline">Deep Lynx</h1>
            </div>
            <div class="mx-3">
                <v-divider class="my-4"></v-divider>
                <h2 class="text-h5 pb-0" style="line-height: 1rem">Current Container</h2>
                <span>{{container.name}}</span>
                <v-divider class="my-4"></v-divider>
                <span class="d-block">{{user.display_name}}</span>
                <span class="d-block text-h6" style="line-height: .875rem">{{user.email}}</span>
            </div>
            <v-list dense class="nav-drawer-accordion mt-2">
                <v-list-item link>
                    <v-list-item-content>
                        <v-list-item-title>{{$t("Dashboard")}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-group :value="false" dense>
                    <template v-slot:activator>
                        <v-list-item-title>{{$t("home.taxonomy")}}</v-list-item-title>
                    </template>

                    <v-list-item two-line link
                                 v-if="$auth.Auth('ontology', 'read', containerID)"
                                 @click="setActiveComponent('metatypes')"
                                 :input-value="currentMainComponent === 'Metatypes'">
                        <v-list-item-content>
                            <v-list-item-title>{{$t("home.metatypes")}}</v-list-item-title>
                            <v-list-item-subtitle>{{$t("home.metatypesDescription")}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>

                    <v-list-item two-line link
                                 v-if="$auth.Auth('ontology', 'read', containerID)"
                                 @click="setActiveComponent('metatype-relationships')"
                                 :input-value="currentMainComponent === 'MetatypeRelationships'">
                        <v-list-item-content>
                            <v-list-item-title>{{$t("home.metatypeRelationships")}}</v-list-item-title>
                            <v-list-item-subtitle>{{$t("home.metatypeRelationshipsDescription")}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>

                    <v-list-item two-line link
                                 v-if="$auth.Auth('ontology', 'read', containerID)"
                                 @click="setActiveComponent('metatype-relationship-pairs')"
                                 :input-value="currentMainComponent === 'MetatypeRelationshipPairs'">
                        <v-list-item-content>
                            <v-list-item-title>{{$t("home.metatypeRelationshipPairs")}}</v-list-item-title>
                            <v-list-item-subtitle>{{$t("home.metatypeRelationshipPairsDescription")}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>

                </v-list-group>

                <v-list-group :value="false" dense>
                    <template v-slot:activator>
                        <v-list-item-title>{{$t("home.data")}}</v-list-item-title>
                    </template>


                    <v-list-item two-line link
                                 v-if="$auth.Auth('data', 'write', containerID)"
                                 @click="setActiveComponent('data-sources')"
                                 :input-value="currentMainComponent === 'DataSources'">
                        <v-list-item-content>
                            <v-list-item-title>{{$t("home.dataSources")}}</v-list-item-title>
                            <v-list-item-subtitle>{{$t("home.dataSourcesDescription")}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item two-line link
                                 v-if="$auth.Auth('data', 'read', containerID)"
                                 @click="setActiveComponent('data-imports')"
                                 :input-value="currentMainComponent === 'DataImports'">
                        <v-list-item-content>
                            <v-list-item-title>{{$t("home.dataImports")}}</v-list-item-title>
                            <v-list-item-subtitle>{{$t("home.dataImportsDescription")}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item two-line link
                                 v-if="$auth.Auth('data','write', containerID)"
                                 @click="setActiveComponent('data-mapping')"
                                 :input-value="currentMainComponent === 'DataMapping'">
                        <v-list-item-content>
                            <v-list-item-title>{{$t("home.dataMapping")}}</v-list-item-title>
                            <v-list-item-subtitle>{{$t("home.dataMappingDescription")}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item two-line link
                                 v-if="$auth.Auth('data', 'write', containerID)"
                                 @click="setActiveComponent('data-export')"
                                 :input-value="currentMainComponent === 'DataExport'">
                        <v-list-item-content>
                            <v-list-item-title>{{$t("home.dataExport")}}</v-list-item-title>
                            <v-list-item-subtitle>{{$t("home.dataExportDescription")}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>

                </v-list-group>

                <v-list-group :value="false" v-if="$auth.Auth('users', 'read', containerID)" dense>
                    <template v-slot:activator>
                        <v-list-item-title>{{$t("home.containerAdministration")}}</v-list-item-title>
                    </template>
                    <v-list-item two-line link
                                 v-if="$auth.Auth('users', 'write', containerID)"
                                 @click="setActiveComponent('container-users')"
                                 :input-value="currentMainComponent === 'ContainerUsers'">
                        <v-list-item-content>
                            <v-list-item-title>{{$t("home.containerUsers")}}</v-list-item-title>
                            <v-list-item-subtitle>{{$t("home.containerUsersDescription")}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-group>

                <v-list-group :value="false" v-if="$auth.IsAdmin()">   <!-- TODO: correct to use auth function -->
                    <template v-slot:activator>
                        <v-list-item-title >{{$t("home.administration")}}</v-list-item-title>
                    </template>

                    <v-list-item  two-line link @click="setActiveComponent('containers')" :input-value="currentMainComponent === 'Metatypes'">
                        <v-list-item-content>
                            <v-list-item-title>{{$t("home.containers")}}</v-list-item-title>
                            <v-list-item-subtitle >{{$t("home.containersDescription")}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>

                    <v-list-item  two-line link @click="setActiveComponent('users')" :input-value="currentMainComponent === 'Metatypes'">
                        <v-list-item-content>
                            <v-list-item-title>{{$t("home.users")}}</v-list-item-title>
                            <v-list-item-subtitle >{{$t("home.usersDescription")}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-group>

                <v-list-item link @click="containerSelect">
                    <v-list-item-content>
                        <v-list-item-title>{{$t("home.changeContainer")}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

              <v-list-item link @click="setActiveComponent('settings')" :input-value="currentMainComponent === 'Settings'">
                <v-list-item-content>
                  <v-list-item-title>{{$t("home.settings")}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

                <v-list-item link @click="logout">
                    <v-list-item-content>
                        <v-list-item-title>{{$t("home.logout")}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            <template v-slot:append>
                <v-container class="justify-end">
                    <span class="d-block text-h6">&copy; 2020</span>
                </v-container>
            </template>
        </v-navigation-drawer>

        <v-app-bar
            app
            color="secondary"
            dark
        >
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
            <v-toolbar-title class="pl-0">{{componentName}}</v-toolbar-title>
            <v-spacer></v-spacer>

            <language-select class="pt-2" style="max-width:125px;"></language-select>
        </v-app-bar>

        <v-main style="padding: 64px 0px 36px 36px">
            <v-container>
                <component v-bind:is="currentMainComponent" :containerID="containerID"></component>
            </v-container>
        </v-main>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator'
    import Metatypes from "@/views/Metatypes.vue"
    import MetatypeRelationships from "@/views/MetatypeRelationships.vue"
    import MetatypeRelationshipPairs from "@/views/MetatypeRelationshipPairs.vue"
    import TaxonomyImport from "@/views/TaxonomyImport.vue"
    import DataExplorer from "@/views/DataExplorer.vue"
    import DataExport from "@/views/DataExport.vue"
    import DataImports from "@/views/DataImports.vue"
    import DataSources from "@/views/DataSources.vue"
    import DataMapping from "@/views/DataMapping.vue"
    import Settings from "@/views/Settings.vue"
    import Users from "@/views/Users.vue"
    import ContainerUsers from "@/views/ContainerUsers.vue"
    import Containers from "@/views/Containers.vue"
    import LanguageSelect from "@/components/languageSelect.vue";
    import ContainerSelect from "@/components/containerSelect.vue"
    import {TranslateResult} from "vue-i18n";
    import {UserT} from "@/auth/types";
    import {ContainerT} from "@/api/types";

    @Component({components: {
            ContainerSelect,
            LanguageSelect,
            DataImports,
            Metatypes,
            MetatypeRelationships,
            MetatypeRelationshipPairs,
            TaxonomyImport,
            DataExplorer,
            DataExport,
            DataSources,
            DataMapping,
            Settings,
            ContainerUsers,
            Users,
            Containers,
        }})
	export default class Home extends Vue {
      @Prop(String) readonly containerID: string | undefined
      @Prop(String) readonly view: string | undefined

        errorMessage = ""
        drawer = null
        user: UserT | null = null
        container: ContainerT | null = null
        currentMainComponent: string | null = ''
        componentName: string | TranslateResult = 'Home'

        mounted() {
          this.user = this.$auth.CurrentUser();

          this.$client.retrieveContainer(this.containerID!)
          .then(container => {
            this.container = container

            if(this.view) {
              this.setActiveComponent(this.view)
            }
          })
          .catch(e => this.errorMessage = e)
        }

        setActiveComponent(menuIndex: string) {
            switch(menuIndex) {
                case "metatypes": {
                    this.currentMainComponent = "Metatypes";
                    this.componentName = this.$t('home.metatypes')
                    break;
                }

                case "metatype-relationships": {
                    this.currentMainComponent = "MetatypeRelationships";
                    this.componentName = this.$t('home.metatypeRelationships')
                    break;
                }

                case "metatype-relationship-pairs": {
                    this.currentMainComponent = "MetatypeRelationshipPairs";
                    this.componentName = this.$t('home.metatypeRelationshipPairs')
                    break;
                }

            case "taxonomy-import": {
                    this.currentMainComponent = "TaxonomyImport";
                    this.componentName = this.$t('home.import')
                    break;
                }

                case "data-sources": {
                    this.currentMainComponent = "DataSources";
                    this.componentName = this.$t('home.dataSources')
                    break;
                }

                case "data-export": {
                    this.currentMainComponent = "DataExport";
                    this.componentName = this.$t('home.dataExport')
                    break;
                }

                case "data-explorer": {
                    this.currentMainComponent = "DataExplorer";
                    this.componentName = this.$t('home.dataExplorer')
                    break;
                }

                case "data-mapping": {
                    this.currentMainComponent = "DataMapping";
                    this.componentName = this.$t('home.dataMapping')
                    break;
                }

                case "data-imports": {
                    this.currentMainComponent = "DataImports"
                    this.componentName = this.$t('home.dataImports')
                    break;
                }

                case "settings": {
                    this.currentMainComponent = "Settings";
                    this.componentName = this.$t('home.settings')
                    break;
                }

                case "users": {
                    this.currentMainComponent = "Users";
                    this.componentName = this.$t('home.users')
                    break;
                }

                case "container-users": {
                    this.currentMainComponent = "ContainerUsers";
                    this.componentName = this.$t('home.containerUsers')
                    break;
                }

                case "containers": {
                    this.currentMainComponent = "Containers"
                    this.componentName = this.$t('home.containers')
                    break;
                }

                case "access-keys": {
                    this.currentMainComponent = "AccessKeys"
                    this.componentName = this.$t('home.accessKeys')
                    break;
                }

                default : {
                    this.currentMainComponent = "";
                    break;
                }
            }
        }

        logout() {
            this.$auth.Logout()
            this.$router.go(0)
        }

        containerSelect() {
            this.$router.push({name: "ContainerSelect"})
        }
    }
</script>

<style lang="scss">
.nav-drawer-accordion.v-list {
    .theme--light.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled) {
        color: darken($darkgray, 25%)!important;
        background-color: $lightgray!important;
        margin-bottom: 1px;
        transition: background-color .1s;

        .theme--light.v-icon {
            color: darken($darkgray, 25%)!important;

        }
    }

    .theme--light.v-list-item .v-list-item__subtitle {
        color: unset!important;
    }

    &-group__items {
        margin:10px;

        .theme--light.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled) {
            color: darken($darkgray, 25%)!important;
            background-color: white!important;
            transition: background-color .1s, color .1s;

            .v-list-item__subtitle {
                color: darken($lightgray, 15%)!important;
                transition: color .1s;
            }
        }
    }

    .theme--light.v-list-item--active,
    .theme--light.v-list-item--active:hover,
    .theme--light.v-list-item--active:before,
    .theme--light.v-list-item--active:hover:before,
    .theme--light.v-list-item--active::before,
    .theme--light.v-list-item--active:hover::before,
    &-item--link:active,
    &-item--link:active:before,
    &-group__header.v-list-item--active:not(:hover):not(:focus) {
        color: white;
        background-color: $darkgray;
        transition: background-color .1s, color .1s;

        & > .v-list-item__subtitle {
            color: white;
            transition: color .1s;
        }
    }

    &-item--active .v-icon {
        color: white!important;

    }
}
</style>
