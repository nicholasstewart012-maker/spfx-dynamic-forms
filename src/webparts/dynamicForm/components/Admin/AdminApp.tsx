import * as React from 'react';
import { IFormDefinition } from '../../../../models/IFormDefinition';
import { AdminDashboard } from './AdminDashboard';
import { FormDesignerV2 } from '../v2/FormDesignerV2';
import { FormDefinitionService } from '../../../../services/FormDefinitionService';
import { SPFI } from '@pnp/sp';
import { v4 as uuidv4 } from 'uuid';

interface IAdminAppProps {
    sp: SPFI;
    currentUserEmail: string;
}

export const AdminApp: React.FC<IAdminAppProps> = (props) => {
    const [view, setView] = React.useState<'list' | 'editor'>('list');
    const [currentForm, setCurrentForm] = React.useState<IFormDefinition | null>(null);
    const service = React.useMemo(() => new FormDefinitionService(props.sp), [props.sp]);

    const handleCreate = () => {
        setCurrentForm({
            id: uuidv4(),
            title: 'New Form',
            description: '',
            sections: [],
            rules: [],
            version: 1,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            author: props.currentUserEmail
        });
        setView('editor');
    };

    const handleEdit = (form: IFormDefinition) => {
        setCurrentForm(form);
        setView('editor');
    };

    const handleSave = async (form: IFormDefinition) => {
        await service.saveForm(form);
        setView('list');
        setCurrentForm(null);
    };

    return (
        <div>
            {view === 'list' && (
                <AdminDashboard
                    sp={props.sp}
                    onCreateForm={handleCreate}
                    onEditForm={handleEdit}
                />
            )}
            {view === 'editor' && currentForm && (
                <FormDesignerV2
                    form={currentForm}
                    sp={props.sp}
                    onSave={handleSave}
                    onCancel={() => setView('list')}
                />
            )}
        </div>
    );
};
