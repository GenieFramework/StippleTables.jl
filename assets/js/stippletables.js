Vue.component("st-table", {
    template: `
    <div>
        <q-table
            row-key="__id"
            :columns="formattedColumns"
            v-model="data"
            :title="title"
            :data="filteredData"
            :pagination="pagination"
            :filter="filter"
            v-on:request="handleRequest"
            :fullscreen="isFullscreen"
            v-bind="$attrs"
            dense
        >
            <template v-slot:top-right>
                <div v-if="showcontrols" class="q-gutter-sm" style="min-width:100%; display:flex">
                    <q-select
                        v-if="aggregatebyisBound"
                        label="Aggregate by"
                        v-model="aggregateby"
                        :options="aggregatebyoptions"
                        dense
                        multiple
                        clearable
                        style="min-width:200px"
                        @input="$emit('update:aggregateby', $event);"
                        @clear="$emit('update:aggregateby', [])"
                    ></q-select>
                    <q-select
                        v-if="aggregatebyisBound && aggregatetarget && aggregatetargetoptions.length"
                        label="Aggregation target"
                        v-model="aggregatetarget"
                        :options="aggregatetargetoptions"
                        dense
                        style="min-width:200px"
                        @input="$emit('update:aggregatetarget', $event);"
                    ></q-select>
                     <q-select
                        v-if="groupbyisBound"
                        label="Group by"
                        v-model="groupby"
                        :options="groupbyoptions"
                        dense
                        clearable
                        style="min-width:200px"
                        @input="$emit('update:groupby', $event);"
                        @clear="$emit('update:groupby', '')"
                    ></q-select>
                    <q-select
                        v-if="groupby && groupkeys.length"
                        label="Group select"
                        v-model="selectedkey"
                        :options="groupkeys"
                        dense
                        style="min-width:200px"
                        @input="$emit('update:selectedkey', $event);"
                    ></q-select>
                    <q-select
                        v-if="searchcolumns && filter"
                        id="filter-columns"
                        label="Filter columns"
                        v-model="selectedColumns"
                        :multiple="true"
                        :options="columnOptions"
                        option-value="name"
                        option-label="label"
                        :use-chips="true"
                        dense
                        style="min-width:200px"
                        @input="$emit('update:selectedColumns', $event);"
                    ></q-select>
                    <q-input
                        v-if="search"
                        debounce="300"
                        v-model="filter"
                        label="Filter"
                        dense
                        style="width: 200px;"
                        @input="$emit('update:filter', $event);"
                    >
                        <template v-slot:append>
                            <q-icon name="search"></q-icon>
                        </template>
                    </q-input>
                    <q-btn
                        v-if="fullscreentoggle"
                        :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                        @click="toggleFullscreen"
                        flat
                        round
                        dense
                    />
                </div>
            </template>
        </q-table>
    </div>
    `,
    props: {
        columns: {
            type: Array,
            required: true
        },
        data: {
            type: Array,
            required: true
        },
        title: {
            type: String,
            default: ''
        },
        pagination: {
            type: Object,
        },
        filter: {
            type: String,
            default: ''
        },
        showcontrols: {
            type: Boolean,
            default: true
        },
        search: {
            type: Boolean,
            default: true
        },
        searchcolumns: {
            type: Boolean,
            default: false
        },
        fullscreentoggle: {
            type: Boolean,
            default: true
        },
        groupby: {
            default: undefined
        },
        groupbyoptions: {
            type: Array,
            default: () => ['']
        },
        groupkeys: {
            type: Array,
            default: () => ['']
        },
        selectedkey: {
            default: ''
        },
        aggregateby: {
            type: Array
        },
        aggregatebyoptions: {
            type: Array
        },
        aggregatetarget: {
            default: undefined
        },
        aggregatetargetoptions: {
            type: Array
        },
        currencycolumns: {
            type: Array,
            default: () => ['']
        }
    },
    inheritAttrs: false,
    data() {
        return {
            selectedColumns: [],
            isFullscreen: false,
            selectedGroupSelect: null,
            groupbyisBound: false,
            aggregatebyisBound: false
        };
    },
    computed: {
        columnOptions() {
            return this.columns.map(col => ({
                label: col.label,
                name: col.name
            }));
        },
        filteredData() {
            console.log("Filter:", this.filter);
            console.log("Selected Columns:", this.selectedColumns);

            console.log(this.groupby);
            // If there's no filter, return all data
            if (!this.filter) {
                return this.data;
            }

            // Determine which columns to search
            const searchColumns = this.selectedColumns.length > 0
                ? this.selectedColumns.map(col => col.name)
                : this.columns.map(col => col.name);

            console.log("Searching in columns:", searchColumns);

            // Filter the data
            return this.data.filter(row => {
                return searchColumns.some(colName => {
                    let value = row[colName];
                    console.log(`Checking column ${colName}:`, value);

                    // Skip null or undefined values
                    if (value == null) return false;

                    // Convert to string and check if it includes the filter
                    return String(value).toLowerCase().includes(this.filter.toLowerCase());
                });
            });
        },
        formattedColumns() {
            return this.columns.map(col => {
                if (this.currencycolumns.includes(col.name)) {
                    return {
                        ...col,
                        format: this.formatCurrency
                    };
                }
                return col;
            });
        }
    },
    methods: {
        handleRequest(event) {
            this.$emit('request', event);
        },
        toggleFullscreen() {
            this.isFullscreen = !this.isFullscreen;
        },
        formatCurrency(value) {
            if (typeof value !== 'number') {
                return value;
            }
            return new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        }
    },
    created() {
        // Check if groupby prop is bound
        this.groupbyisBound = this.$options.propsData.hasOwnProperty('groupby');
        this.aggregatebyisBound = this.$options.propsData.hasOwnProperty('aggregateby');
    }
});
