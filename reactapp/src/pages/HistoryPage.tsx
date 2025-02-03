import { ActionButton, DatePicker, DayOfWeek, defaultDatePickerStrings, DetailsListLayoutMode, IColumn, IconButton, Label, SelectionMode, ShimmeredDetailsList, Stack } from '@fluentui/react';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import styles from '../App.module.scss';
import { ICostReport } from '../App.types';
import TranscriptionHelper from '../common/TranscriptionHelper';
import PageHeader from '../components/PageHeader';
import useApi from '../hooks/useApi';

interface IHistoryPageProps {
    title: string;
    showAllHistory: boolean;
}

const HistoryPage = (props: IHistoryPageProps): JSX.Element => {

    const { getCostReports} = useApi();

    const [showShimmer, setShowShimmer] = useState<boolean>(true);  
    const [reports, setReports] = useState<ICostReport[]>([]);
    const [filteredReports, setFilteredReports] = useState<ICostReport[]>([]);
    const [startDate, setStartDate] = useState<Date|undefined>(dayjs().startOf('month').toDate());
    const [endDate, setEndDate] = useState<Date|undefined>(dayjs().endOf('month').toDate());

    const [errorMessage, setErrorMessage] = useState<string>('');
  
    const columns: IColumn[] = [
        { key: 'userEPPN', fieldName: 'userEPPN', name: 'Username', minWidth:100, maxWidth:150, isResizable: true }
    ];
    
    if (import.meta.env.VITE_BILLING_COSTCENTER_VISIBLE === "true") {
        columns.push({ key: 'costCenter', fieldName: 'costCenter', name: 'Cost center', minWidth: 80, maxWidth:100, isResizable: true});
    }
    if (import.meta.env.VITE_BILLING_COSTACTIVITY_VISIBLE === "true") {  
        columns.push({ key: 'costActivity', fieldName: 'costActivity', name: 'Cost activity', minWidth: 80, maxWidth:100, isResizable: true });
    }

    columns.push({ key: 'created', fieldName: 'created', name: 'Uploaded', minWidth: 80, maxWidth:100, isResizable: true,
        onRender: (report: ICostReport) => {        
          return (
            <div>{ TranscriptionHelper.formatDate(report.created) }</div>
          );      
        },
      },
    );

    columns.push({ key: 'length', fieldName: 'length', name: 'Transcription time (seconds)', minWidth: 80, maxWidth:100, isResizable: true,
        onRender: (report: ICostReport) => {        
          return (
            <div>{ report.length }</div>
          );      
        },
      }
    );
     
    useEffect(() => {
        getReports();
    }, []);
    
    useEffect(() => {       
        if (startDate && endDate) {
            const endDateMidnight = dayjs(endDate).endOf('day').toDate();
            console.log(endDateMidnight);
            const newFilteredReports = reports.filter(x => {
                                        const created = dayjs(x.created).toDate();
                                        return created >= startDate && created <= endDateMidnight;
                                    });

            setFilteredReports(newFilteredReports);
        }
        else {
            setFilteredReports(reports);
        }

    }, [reports, startDate, endDate]);

    const getReports = async () => {
        setShowShimmer(true);

        getCostReports(props.showAllHistory)
        .then((data: ICostReport[]) => {
            console.log("getCostReport:");
            console.log(data);

            setReports(data);
            setErrorMessage('');
        })
        .catch((error: AxiosError) => {        
            console.log("Error getting transcriptions", error);
            setErrorMessage("Error getting translations: " + error.message);
        })
        .finally(() => {
            setShowShimmer(false);
        })
    };
    
    const convertReportsToCSV = ():string => {
        const header = columns.map(c => c.name).join('\t');
        const rows = filteredReports.map(c => `${c.userEPPN}\t${c.costCenter}\t${c.costActivity}\t${TranscriptionHelper.formatDate(c.started)}\t${c.length}`);

        return header + '\n' + rows.join('\n');
    }

    const copyToClipboard = () => {
        const data = convertReportsToCSV();
        navigator.clipboard.writeText(data);
    }

    const onFormatData = (date?: Date) => {
        return date ? dayjs(date).format('YYYY-MM-DD') : '';
    }

    const prevMonth = () => {
        if (startDate?.getDate() === 1) {
            const newStart = dayjs(startDate).subtract(1, 'month').toDate();
            const newEnd = dayjs(newStart).endOf('month').toDate();            
            setStartDate(newStart);
            setEndDate(newEnd);
        } else {
            setStartDate(dayjs(startDate).startOf('month').toDate());
            setEndDate(dayjs(startDate).endOf('month').toDate());
        }
    }

    const nextMonth = () => {
        if (startDate?.getDate() === 1) {
            const newStart = dayjs(startDate).add(1, 'month').toDate();
            const newEnd = dayjs(newStart).endOf('month').toDate();            
            setStartDate(newStart);
            setEndDate(newEnd);
        } else {
            setStartDate(dayjs(startDate).startOf('month').add(1, 'month').toDate());
            setEndDate(dayjs(startDate).add(1, 'month').endOf('month').toDate());
        }        
    }

    return (
        <div className={styles.content}>

            <PageHeader backTo='/' title={props.title} /> 

            <Stack horizontal tokens={{childrenGap: 16}} verticalAlign='center'>

                <Label>Filter by date interval:</Label>
                <DatePicker
                    style={{minWidth: '150px'}}
                    firstDayOfWeek={DayOfWeek.Monday}
                    placeholder="Select start date"
                    ariaLabel="Select start date"
                    formatDate={onFormatData}
                    strings={defaultDatePickerStrings}
                    value={startDate}
                    maxDate={dayjs().endOf('month').toDate()}
                    onSelectDate={(date) => setStartDate(date ?? undefined)}
                />

                <DatePicker
                    style={{minWidth: '150px'}}
                    firstDayOfWeek={DayOfWeek.Monday}
                    placeholder="Select end date"
                    ariaLabel="Select end date"
                    formatDate={onFormatData}    
                    strings={defaultDatePickerStrings}    
                    value={endDate}
                    minDate={startDate}
                    maxDate={dayjs().endOf('month').toDate()}
                    onSelectDate={(date) => setEndDate(date ?? undefined)}
                />

                <div>
                    <ActionButton iconProps={{iconName: 'ChevronLeft'}} onClick={prevMonth} title='Previous month' />
                    <ActionButton iconProps={{iconName: 'ChevronRight'}} onClick={nextMonth} title='Next month' disabled={dayjs().isSame(startDate, 'month')} />
                </div>

                <ActionButton
                    iconProps={{iconName: 'Copy'}} 
                    onClick={copyToClipboard}>
                        Copy to clipboard
                </ActionButton>
            </Stack>



            <ShimmeredDetailsList
                enableShimmer={showShimmer}
                shimmerLines={4}
                items={filteredReports || []}
                columns={columns}
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.none}
            />

            { errorMessage &&
            <p className={styles.warning}>{errorMessage}</p>
            }

        </div>
    );
};

export default HistoryPage;
