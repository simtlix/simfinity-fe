import { registerEntityStateMachine } from '@/components/simfinity-fe/lib/stateMachineRegistry';
import { CollectionFieldState, EntityFormCallbackActions } from '@/components/simfinity-fe/lib/formCustomization';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apolloClient';

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
            // Use Apollo client from actions
            
            if (!apolloClient) {
              throw new Error('Apollo client not available');
            }
            
            // Query server to get actual episodes count using Simfinity pattern
            const GET_EPISODES_COUNT = gql`
              query GetEpisodesCount($seasonId: QLValue!, $page: Int!, $size: Int!, $count: Boolean!) {
                episodes(
                  season: { terms: { path: "id", operator: EQ, value: $seasonId } }
                  pagination: { page: $page, size: $size, count: $count }
                ) {
                  id
                }
              }
            `;
            
            const result = await apolloClient.query({
              query: GET_EPISODES_COUNT,
              variables: { 
                seasonId: transformedData.id,   
                page: 1,
                size: 1, // We only need count
                count: true
              },
              fetchPolicy: 'network-only' // Always fetch fresh data
            });
            
            // Apollo doesn't expose extensions directly on result, but simfinity returns count in extensions
            const existingEpisodesCount = result.data?.episodes?.length || 0;
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
          
          // Example: Log activation event
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
            // Get Apollo client and schema data from global context
            
            if (!apolloClient) {
              throw new Error('Apollo client not available');
            }
            
            // Query server to get actual episodes with their air dates using Simfinity pattern
            const GET_EPISODES = gql`
              query GetEpisodes($seasonId: QLValue!, $page: Int!, $size: Int!, $count: Boolean!) {
                episodes(
                  season: { terms: { path: "id", operator: EQ, value: $seasonId } }
                  pagination: { page: $page, size: $size, count: $count }
                ) {
                    id
                    date
                }
              }
            `;
            
            const { data } = await apolloClient.query({
              query: GET_EPISODES,
              variables: { 
                seasonId: transformedData.id,
                page: 1,
                size: 1000, // Get all episodes (adjust if needed)
                count: true
              },
              fetchPolicy: 'network-only' // Always fetch fresh data
            });
            
            const existingEpisodes = data?.episodes || [];
            const episodesChanges = collectionChanges.episodes || { added: [], modified: [], deleted: [] };
            
            // Check existing episodes for completion
            const incompleteExistingEpisodes = existingEpisodes.filter((episode: { date?: string }) => 
              !episode.date || new Date(episode.date) > new Date()
            );
            
            // Check new episodes for completion
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
          
          // Example: Log finalization event
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
