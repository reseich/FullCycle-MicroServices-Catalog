import * as React from 'react';
import {useContext, useEffect, useState} from 'react';
import format from 'date-fns/format'
import parseIso from 'date-fns/parseISO'
import categoryHttp from "../../util/http/categoryHttp";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {Category, ListResponse} from "../../util/models";
import DefaultTable, {makeActionStyles, TableColumn} from '../../components/Table'
import {useSnackbar} from "notistack";
import {MuiThemeProvider} from "@material-ui/core/styles";
import {IconButton} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {Link} from "react-router-dom";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import useFilter from "../../hooks/useFilter";
import LoadingContext from "../../components/loading/LoadingContext";

const debounceTimeValue = 300
const rowsPerPage = 15
const rowsPerPageOptions = [15, 25, 50]
const columnsDefinitions: TableColumn[] = [
    {
        name: 'id',
        label: 'Id',
        width: '30%',
        options: {
            filter: false,
            sort: false
        }
    },
    {
        name: 'name',
        label: 'Name',
        width: '43%',
        options: {
            filter: false
        }
    },
    {
        name: 'is_active',
        label: 'Active?',
        width: '4%',
        options: {
            filterOptions: {
                names: ['Yes', 'No']
            },
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes/> : <BadgeNo/>
            }
        }
    },
    {
        name: 'created_at',
        label: 'Created at',
        width: '10%',
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseIso(value), 'dd/MM/yyyy')}</span>
            }
        }
    },
    {
        name: 'actions',
        label: 'Actions',
        width: '13%',
        options: {
            sort: false,
            filter: false,
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={'/categories/' + tableMeta.rowData[0] + '/edit'}
                    >
                        <EditIcon fontSize={'inherit'}/>
                    </IconButton>
                )
            }
        }
    },
]

const Table = () => {
    const {enqueueSnackbar} = useSnackbar();
    const [data, setData] = useState<Category[]>([])
    const loading = useContext(LoadingContext);
    const {
        filterManager,
        cleanSearchText,
        filterState,
        totalRecords,
        setTotalRecords,
        debouncedFilterState,
    } = useFilter({
        columns: columnsDefinitions,
        debounceTime: debounceTimeValue,
        rowsPerPage,
        rowsPerPageOptions
    })

    useEffect(() => {
        categoryHttp.list<ListResponse<Category>>(
            {
                queryParams: {
                    search: cleanSearchText(debouncedFilterState.search),
                    page: debouncedFilterState.pagination.page,
                    per_page: debouncedFilterState.pagination.per_page,
                    sort: debouncedFilterState.order.name,
                    dir: debouncedFilterState.order.direction
                }
            }
        ).then(({data}) => {
            setTotalRecords(data.meta.total)
            setData(data.data)
        }).catch((error) => {
            if (categoryHttp.isCancelRequest(error)) {
                return
            }
            enqueueSnackbar('Cannot retrieve information', {variant: 'error'})
        })

    }, [debouncedFilterState.search,
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        setTotalRecords,
        enqueueSnackbar,
        cleanSearchText])

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinitions.length - 1)}>
            <DefaultTable
                debouncedTimeSearch={debounceTimeValue}
                loading={loading}
                columns={columnsDefinitions}
                data={data}
                reset={filterState.reset}
                title={''}
                options={{
                    sortOrder: filterState.order,
                    serverSide: true,
                    searchText: filterState.search,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    customToolbar: () => (<FilterResetButton handleClick={() => filterManager.resetFilter()}/>),
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (per_page) => filterManager.changeRowsPerPage(per_page),
                    onColumnSortChange: (changedColumn, direction) => filterManager.changeColumnSort(changedColumn, direction),
                }}>
            </DefaultTable>
        </MuiThemeProvider>
    );
};

export default Table