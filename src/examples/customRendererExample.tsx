import * as React from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { registerFormCustomization, FormField, FormCustomizationActions, ParentFormAccess } from '@/components/simfinity-fe/lib/formCustomization';

// Example of custom field renderers and custom collection renderers using JSX
export function setupCustomRendererExamples() {
  
  // Example 1: Custom field renderer for a rich text field
  registerFormCustomization("serie", "edit", {
    fieldsCustomization: {
      description: {
        size: { xs: 12, sm: 12, md: 12 },
        order: 2,
        // Custom renderer for rich description field
        customRenderer: (field: FormField, customizationActions: FormCustomizationActions, handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void, disabled: boolean) => {
          return (
            <TextField
              fullWidth
              label="Description (Custom Renderer)"
              multiline
              rows={4}
              value={field.value as string || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleFieldChange(field.name, e.target.value)}
              disabled={disabled}
              error={!!field.error}
              helperText={field.error}
              variant="outlined"
              sx={{ backgroundColor: 'rgba(0, 255, 0, 0.05)' }} // Light green background to show it's custom
            />
          );
        }
      },
      
      // Example 2: Custom renderer for tags/categories field  
      tags: {
        size: { xs: 12, sm: 6, md: 6 },
        order: 3,
        customRenderer: (field: FormField, customizationActions: FormCustomizationActions, handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void, disabled: boolean) => {
          const TagRenderer = () => {
            const [newTag, setNewTag] = React.useState('');
            const tags = (field.value as string[]) || [];
          
            const addTag = () => {
              if (newTag.trim() && !tags.includes(newTag.trim())) {
                const updatedTags = [...tags, newTag.trim()];
                handleFieldChange(field.name, updatedTags);
                setNewTag('');
              }
            };
            
            const removeTag = (tagToRemove: string) => {
              const updatedTags = tags.filter(tag => tag !== tagToRemove);
              handleFieldChange(field.name, updatedTags);
            };
            
            return (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {tags.map((tag: string) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={disabled ? undefined : () => removeTag(tag)}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Add new tag"
                    value={newTag}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    disabled={disabled}
                  />
                  <Button
                    size="small"
                    onClick={addTag}
                    disabled={disabled || !newTag.trim()}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
            );
          };
          
          return <TagRenderer />;
        }
      }
    }
  });

  // Example 3: Custom collection renderer for episodes with a card-based layout
  registerFormCustomization("serie", "edit", {
    fieldsCustomization: {
      // Custom collection renderer for episodes
      episodes: {
        size: { xs: 12, sm: 12, md: 12 },
        order: 4,
        customCollectionRenderer: (_collectionFieldName: string, _parentFormAccess: ParentFormAccess, collectionState: Record<string, unknown>, onCollectionStateChange: (newState: Record<string, unknown>) => void) => {
          const EpisodeRenderer = () => {
            const [dialogOpen, setDialogOpen] = React.useState(false);
            const [editingItem, setEditingItem] = React.useState<Record<string, unknown> | null>(null);
          
            const allItems = [
              ...((collectionState.added as Record<string, unknown>[]) || []),
              ...((collectionState.modified as Record<string, unknown>[]) || []),
              ...((collectionState as { original?: Record<string, unknown>[] }).original || [])
            ].filter((item: Record<string, unknown>) => item.__status !== 'deleted');
          
            const handleAddItem = () => {
              setEditingItem(null);
              setDialogOpen(true);
            };
            
            const handleEditItem = (item: Record<string, unknown>) => {
              setEditingItem(item);
              setDialogOpen(true);
            };
            
            const handleDeleteItem = (item: Record<string, unknown>) => {
              const updatedState = {
                ...collectionState,
                deleted: [...((collectionState.deleted as Record<string, unknown>[]) || []), { ...item, __status: 'deleted' as const }]
              };
              onCollectionStateChange(updatedState);
            };
            
            const handleSaveItem = (itemData: Record<string, unknown>) => {
              if (editingItem) {
                const updatedState = {
                  ...collectionState,
                  modified: (collectionState.modified as Record<string, unknown>[]).some((item: Record<string, unknown>) => item.id === editingItem.id)
                    ? (collectionState.modified as Record<string, unknown>[]).map((item: Record<string, unknown>) => 
                        item.id === editingItem.id ? { ...itemData, __status: 'modified' as const } : item
                      )
                    : [...(collectionState.modified as Record<string, unknown>[]), { ...itemData, __status: 'modified' as const }]
                };
                onCollectionStateChange(updatedState);
              } else {
                const newItem = {
                  ...itemData,
                  id: `temp-${Date.now()}`,
                  __status: 'added' as const
                };
                const updatedState = {
                  ...collectionState,
                  added: [...((collectionState.added as Record<string, unknown>[]) || []), newItem]
                };
                onCollectionStateChange(updatedState);
              }
              setDialogOpen(false);
            };
            
            return (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Episodes</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    variant="contained"
                    size="small"
                  >
                    Add Episode
                  </Button>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                  {allItems.map((episode: Record<string, unknown>) => (
                    <Card
                      key={String(episode.id) || `episode-${episode.name}`}
                      variant="outlined"
                      sx={{ 
                        opacity: episode.__status === 'deleted' ? 0.5 : 1,
                        borderColor: episode.__status === 'added' ? 'success.main' : 
                                    episode.__status === 'modified' ? 'warning.main' : 'divider'
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {String(episode.name) || 'Untitled Episode'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Episode {String(episode.number) || '?'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {String(episode.description) || 'No description'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleEditItem(episode)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteItem(episode)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                
                <Dialog
                  open={dialogOpen}
                  onClose={() => setDialogOpen(false)}
                  maxWidth="sm"
                  fullWidth
                >
                  <DialogTitle>
                    {editingItem ? 'Edit Episode' : 'Add Episode'}
                  </DialogTitle>
                  <DialogContent>
                    <TextField
                      fullWidth
                      label="Episode Name"
                      defaultValue={String(editingItem?.name) || ''}
                      sx={{ mb: 2 }}
                      id="episode-name-input"
                    />
                    <TextField
                      fullWidth
                      label="Episode Number"
                      type="number"
                      defaultValue={String(editingItem?.number) || ''}
                      sx={{ mb: 2 }}
                      id="episode-number-input"
                    />
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      defaultValue={String(editingItem?.description) || ''}
                      id="episode-description-input"
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        const nameInput = document.getElementById('episode-name-input') as HTMLInputElement;
                        const numberInput = document.getElementById('episode-number-input') as HTMLInputElement;
                        const descriptionInput = document.getElementById('episode-description-input') as HTMLInputElement;
                        
                        handleSaveItem({
                          ...(editingItem || {}),
                          name: nameInput?.value || '',
                          number: parseInt(numberInput?.value || '0'),
                          description: descriptionInput?.value || ''
                        });
                      }}
                      variant="contained"
                    >
                      Save
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
            );
          };
          
          return <EpisodeRenderer />;
        }
      }
    }
  });

  // Example 4: Custom collection renderer for cast with a list-based layout
  registerFormCustomization("serie", "edit", {
    fieldsCustomization: {
      cast: {
        size: { xs: 12, sm: 6, md: 6 },
        order: 5,
        customCollectionRenderer: (_collectionFieldName: string, _parentFormAccess: ParentFormAccess, collectionState: Record<string, unknown>, onCollectionStateChange: (newState: Record<string, unknown>) => void) => {
          const CastRenderer = () => {
            const [newActorName, setNewActorName] = React.useState('');
            const [newActorRole, setNewActorRole] = React.useState('');
            
            const allItems = [
              ...((collectionState.added as Record<string, unknown>[]) || []),
              ...((collectionState.modified as Record<string, unknown>[]) || []),
              ...((collectionState as { original?: Record<string, unknown>[] }).original || [])
            ].filter((item: Record<string, unknown>) => item.__status !== 'deleted');
            
            const handleAddActor = () => {
              if (newActorName.trim() && newActorRole.trim()) {
                const newActor = {
                  id: `temp-${Date.now()}`,
                  name: newActorName.trim(),
                  role: newActorRole.trim(),
                  __status: 'added' as const
                };
                
                const updatedState = {
                  ...collectionState,
                  added: [...((collectionState.added as Record<string, unknown>[]) || []), newActor]
                };
                
                onCollectionStateChange(updatedState);
                setNewActorName('');
                setNewActorRole('');
              }
            };
            
            const handleRemoveActor = (actor: Record<string, unknown>) => {
              const updatedState = {
                ...collectionState,
                deleted: [...((collectionState.deleted as Record<string, unknown>[]) || []), { ...actor, __status: 'deleted' as const }]
              };
              onCollectionStateChange(updatedState);
            };
            
            return (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Cast
                </Typography>
                
                <List dense>
                  {allItems.map((actor: Record<string, unknown>) => (
                    <ListItem
                      key={String(actor.id) || `actor-${actor.name}`}
                      sx={{ 
                        bgcolor: actor.__status === 'added' ? 'success.50' : 
                                actor.__status === 'modified' ? 'warning.50' : 'background.paper',
                        mb: 1,
                        borderRadius: 1
                      }}
                    >
                      <ListItemText
                        primary={String(actor.name)}
                        secondary={`as ${String(actor.role)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleRemoveActor(actor)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                
                <Box sx={{ mt: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Add Cast Member
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Actor Name"
                      value={newActorName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewActorName(e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      size="small"
                      placeholder="Role/Character"
                      value={newActorRole}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewActorRole(e.target.value)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <Button
                    size="small"
                    onClick={handleAddActor}
                    disabled={!newActorName.trim() || !newActorRole.trim()}
                    variant="outlined"
                  >
                    Add to Cast
                  </Button>
                </Box>
              </Box>
            );
          };
          
          return <CastRenderer />;
        }
      }
    }
  });
}

// Call this function in your app initialization
// setupCustomRendererExamples();