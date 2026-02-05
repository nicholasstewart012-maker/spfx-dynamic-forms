import * as React from 'react';
import { DetailsList, IColumn, CommandBar, ICommandBarItemProps, SelectionMode } from '@fluentui/react';
import { IFormDefinition } from '../../../../models/IFormDefinition';
import { FormDefinitionService } from '../../../../services/FormDefinitionService';
import { SPFI } from '@pnp/sp';

interface IAdminDashboardProps {
    sp: SPFI;
    onEditForm: (form: IFormDefinition) => void;
    onCreateForm: () => void;
}

export const AdminDashboard: React.FC<IAdminDashboardProps> = (props) => {
    const [forms, setForms] = React.useState<IFormDefinition[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const service = React.useMemo(() => new FormDefinitionService(props.sp), [props.sp]);

    React.useEffect(() => {
        loadForms().catch((e: any) => console.error(e));
    }, []);

    const loadForms = async () => {
        setIsLoading(true);
        const result = await service.getForms();
        setForms(result);
        setIsLoading(false);
    };

    const columns: IColumn[] = [
        { key: 'title', name: 'Title', fieldName: 'title', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'status', name: 'Status', fieldName: 'status', minWidth: 60, maxWidth: 100 },
        { key: 'version', name: 'Version', fieldName: 'version', minWidth: 50, maxWidth: 50 },
        { key: 'modified', name: 'Last Modified', fieldName: 'modified', minWidth: 100, maxWidth: 150 },
        {
            key: 'action', name: 'Action', minWidth: 100, onRender: (item) => (
                <button onClick={() => props.onEditForm(item)}>Edit</button>
            )
        }
    ];

    const commandItems: ICommandBarItemProps[] = [
        {
            key: 'newItem',
            text: 'New Form',
            iconProps: { iconName: 'Add' },
            onClick: props.onCreateForm
        },
        {
            key: 'refresh',
            text: 'Refresh',
            iconProps: { iconName: 'Refresh' },
            onClick: () => loadForms().catch((e: any) => console.error(e))
        }
    ];

    return (
        <div>
            <CommandBar items={commandItems} />
            {isLoading ? <div>Loading...</div> :
                <DetailsList
                    items={forms}
                    columns={columns}
                    selectionMode={SelectionMode.none}
                />
            }
        </div>
    );
};
