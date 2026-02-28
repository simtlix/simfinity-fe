import { registerEntityStateMachine } from '@simtlix/simfinity-fe-components';
import { CollectionFieldState, EntityFormCallbackActions } from '@simtlix/simfinity-fe-components';
import { getSimfinityClient } from '@/lib/simfinityClientRef';

/**
 * Example of how to register state machine for season entity
 * This should be called during application initialization
 */
export function setupSeasonStateMachine() {
  registerEntityStateMachine("season", {
    actions: {
      activate: {
        mutation: 'activate_season',
        from: 'SCHEDULED',
        to: 'ACTIVE',
        onBeforeSubmit: async (formData: Record<string, unknown>, collectionChanges: Record<string, CollectionFieldState>, transformedData: Record<string, unknown>, actions: EntityFormCallbackActions) => {
          console.log('Before activating season:', { formData, collectionChanges, transformedData });
          
          try {
            const client = getSimfinityClient();

            const result = await client.findByParent('Episode', 'season', transformedData.id as string)
              .fields('id')
              .page(1, 1, true)
              .execWithMeta();

            const existingEpisodesCount = typeof result.extensions?.count === 'number' ? result.extensions.count : 0;
            const episodesChanges = collectionChanges.episodes || { added: [], modified: [], deleted: [] };
            const newEpisodesCount = episodesChanges.added.length;
            const totalEpisodesCount = existingEpisodesCount + newEpisodesCount;
            
            console.log('Episodes validation:', {
              existingEpisodesCount,
              newEpisodesCount,
              totalEpisodesCount
            });
            
            if (totalEpisodesCount === 0) {
              actions.setFormMessage({
                type: 'error',
                message: 'Cannot activate season without episodes'
              });
              return { shouldProceed: false, error: 'Season must have at least one episode to be activated' };
            }
            
            return { shouldProceed: true };
          } catch (error) {
            console.error('Failed to validate episodes:', error);
            actions.setFormMessage({
              type: 'error',
              message: 'Failed to validate episodes before activation'
            });
            return { shouldProceed: false, error: 'Failed to validate episodes' };
          }
        },
        onSuccess: async (result, formData, collectionChanges, transformedData, actions) => {
          console.log('Season activated successfully:', result);
          
          actions.setFormMessage({
            type: 'success',
            message: 'Season activated successfully!'
          });
          
          const episodesChanges = collectionChanges.episodes || { added: [], modified: [], deleted: [] };
          console.log('Season activation logged:', {
            seasonId: transformedData.id,
            episodesCount: episodesChanges.added.length + Object.keys(episodesChanges.modified).length
          });
        },
        onError: async (error, formData, collectionChanges, transformedData, actions) => {
          console.error('Failed to activate season:', error);
          
          actions.setFormMessage({
            type: 'error',
            message: `Failed to activate season: ${error.message}`
          });
        }
      },
      finalize: {
        mutation: 'finalize_season',
        from: 'ACTIVE',
        to: 'FINISHED',
        onBeforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
          console.log('Before finalizing season:', { formData, collectionChanges, transformedData });
          
          try {
            const client = getSimfinityClient();

            const result = await client.findByParent('Episode', 'season', transformedData.id as string)
              .fields('id date')
              .page(1, 1000, true)
              .execWithMeta();

            const existingEpisodes = (result.data ?? []) as Array<{ id: string; date?: string }>;
            const episodesChanges = collectionChanges.episodes || { added: [], modified: [], deleted: [] };
            
            const incompleteExistingEpisodes = existingEpisodes.filter((episode) => 
              !episode.date || new Date(episode.date) > new Date()
            );
            
            const incompleteNewEpisodes = episodesChanges.added.filter((episode) => 
              !episode.date || new Date(episode.date as string) > new Date()
            );
            
            const totalIncompleteEpisodes = incompleteExistingEpisodes.length + incompleteNewEpisodes.length;
            
            console.log('Episodes completion validation:', {
              existingEpisodesCount: existingEpisodes.length,
              incompleteExistingEpisodes: incompleteExistingEpisodes.length,
              newEpisodesCount: episodesChanges.added.length,
              incompleteNewEpisodes: incompleteNewEpisodes.length,
              totalIncompleteEpisodes
            });
            
            if (totalIncompleteEpisodes > 0) {
              actions.setFormMessage({
                type: 'error',
                message: 'Cannot finalize season with incomplete episodes'
              });
              return { shouldProceed: false, error: 'All episodes must be completed before finalizing season' };
            }
            
            
            return { shouldProceed: true };
          } catch (error) {
            console.error('Failed to validate episodes completion:', error);
            actions.setFormMessage({
              type: 'error',
              message: 'Failed to validate episodes completion before finalization'
            });
            return { shouldProceed: false, error: 'Failed to validate episodes completion' };
          }
        },
        onSuccess: async (result, formData, collectionChanges, transformedData, actions) => {
          console.log('Season finalized successfully:', result);
          
          actions.setFormMessage({
            type: 'success',
            message: 'Season finalized successfully!'
          });
          
          const episodesChanges = collectionChanges.episodes || { added: [], modified: [], deleted: [] };
          console.log('Season finalization logged:', {
            seasonId: transformedData.id,
            totalEpisodes: episodesChanges.added.length + Object.keys(episodesChanges.modified).length
          });
        },
        onError: async (error, formData, collectionChanges, transformedData, actions) => {
          console.error('Failed to finalize season:', error);
          
          actions.setFormMessage({
            type: 'error',
            message: `Failed to finalize season: ${error.message}`
          });
        }
      }
    }
  });
}
