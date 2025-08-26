import { useCollectionState } from '@/hooks/useCollectionState';
import CollectionFieldGrid from '@/components/CollectionFieldGrid';

// Example of how to use the enhanced CollectionFieldGrid in a form
export function CollectionManagementExample() {
  const { 
    updateCollectionState, 
    getCollectionState,
    getCollectionChanges 
  } = useCollectionState();

  // Example form data
  const formData = {
    id: '123',
    name: 'Example Entity',
    // ... other fields
  };

  // Example collection field configuration
  const collectionFields = [
    {
      name: 'episodes',
      objectTypeName: 'episode',
      connectionField: 'serie'
    },
    {
      name: 'seasons',
      objectTypeName: 'season', 
      connectionField: 'serie'
    }
  ];

  const handleFormSubmit = () => {
    // Get all collection changes
    const changes = getCollectionChanges();
    
    console.log('Collection changes to be submitted:', changes);
    
    // Example of what the changes object looks like:
    // {
    //   episodes: {
    //     added: [
    //       { id: 'temp_123', name: 'New Episode', __status: 'added' }
    //     ],
    //     modified: [
    //       { id: '456', name: 'Modified Episode', __status: 'modified', __originalData: { id: '456', name: 'Original Name' } }
    //     ],
    //     deleted: [
    //       { id: '789', name: 'Deleted Episode', __status: 'deleted' }
    //     ]
    //   },
    //   seasons: {
    //     added: [],
    //     modified: [],
    //     deleted: []
    //   }
    // }
    
    // Here you would:
    // 1. Create new items (added)
    // 2. Update modified items
    // 3. Delete deleted items
    // 4. Submit the main entity
  };

  return (
    <div>
      <h1>Entity Form with Collection Management</h1>
      
      {/* Main form fields would go here */}
      <div>
        <label>Name: {formData.name}</label>
        {/* ... other form fields */}
      </div>

      {/* Collection fields */}
      {collectionFields.map(field => (
        <CollectionFieldGrid
          key={field.name}
          parentEntityType="serie"
          collectionField={field}
          parentEntityId={formData.id}
          isEditMode={true}
          collectionState={getCollectionState(field.name)}
          onCollectionStateChange={updateCollectionState}
        />
      ))}

      <button onClick={handleFormSubmit}>
        Submit Form with Collection Changes
      </button>
    </div>
  );
}

// Example of how to handle the collection changes in your mutation
export function handleCollectionChanges(
  collectionChanges: ReturnType<typeof useCollectionState>['collectionStates']
) {
  const mutations: Array<{
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    collection: string;
    id?: string;
    data?: Record<string, unknown>;
  }> = [];

  // Process each collection field
  Object.entries(collectionChanges).forEach(([fieldName, fieldState]) => {
    // Handle added items
    fieldState.added.forEach(item => {
      mutations.push({
        type: 'CREATE',
        collection: fieldName,
        data: { ...item, __status: undefined, __originalData: undefined }
      });
    });

    // Handle modified items
    fieldState.modified.forEach(item => {
      mutations.push({
        type: 'UPDATE',
        collection: fieldName,
        id: item.id,
        data: { ...item, __status: undefined, __originalData: undefined }
      });
    });

    // Handle deleted items
    fieldState.deleted.forEach(item => {
      mutations.push({
        type: 'DELETE',
        collection: fieldName,
        id: item.id
      });
    });
  });

  return mutations;
}
