import { PayloadAction } from "@reduxjs/toolkit"

import { RootEntity } from "@stator/models"
import { SliceState } from "./SliceState"
import { ThunkFactoryType } from "./thunkFactory"

export type PayloadEntityAction<T> = PayloadAction<T, string, { arg: T }>
export type PayloadErrorAction<T> = PayloadAction<T, string, { arg: T }, Error>

export const sliceReducerFactory = <T extends RootEntity, TSliceState extends SliceState<T>>(
  thunks: ThunkFactoryType
) => {
  return {
    // GET
    [thunks.get.pending as any]: (state: TSliceState, action: PayloadEntityAction<T>) => {
      state.status.get.ids[action.meta.arg.id] = true
      state.status.error = null
    },
    [thunks.get.fulfilled as any]: (state: TSliceState, action: PayloadEntityAction<T>) => {
      // This function ensures that we keep the position on the fetched item if already existing
      const entities = [...state.entities]
      const index = entities.findIndex(entity => entity.id === action.payload.id)
      if (index === -1) {
        entities.push(action.payload)
      } else {
        entities[index] = action.payload
      }

      state.entities = entities
      state.status.get.ids[action.meta.arg.id] = false
    },
    [thunks.get.rejected as any]: (state: TSliceState, action: PayloadErrorAction<T>) => {
      state.status.get.ids[action.meta.arg.id] = false
      state.status.error = action.error
    },

    // GET ALL
    [thunks.getAll.pending as any]: (state: TSliceState) => {
      state.status.getAll.loading = true
      state.status.error = null
    },
    [thunks.getAll.fulfilled as any]: (state: TSliceState, action: PayloadAction<T[]>) => {
      state.entities = action.payload
      state.status.getAll.loading = false
    },
    [thunks.getAll.rejected as any]: (state: TSliceState, action: PayloadErrorAction<T>) => {
      state.status.getAll.loading = false
      state.status.error = action.error
    },

    // POST
    [thunks.post.pending as any]: (state: TSliceState) => {
      state.status.post.loading = true
      state.status.error = null
    },
    [thunks.post.fulfilled as any]: (state: TSliceState, action: PayloadAction<T>) => {
      state.entities = [...state.entities, action.payload]
      state.status.post.loading = false
    },
    [thunks.post.rejected as any]: (state: TSliceState, action: PayloadErrorAction<T>) => {
      state.status.post.loading = false
      state.status.error = action.error
    },

    // PUT
    [thunks.put.pending as any]: (state: TSliceState, action: PayloadEntityAction<T>) => {
      state.status.put.ids[action.meta.arg.id] = true
      state.status.error = null
    },
    [thunks.put.fulfilled as any]: (state: TSliceState, action: PayloadAction<T>) => {
      state.entities = state.entities.map(entity => (entity.id === action.payload.id ? action.payload : entity))
      state.status.put.ids[action.payload.id] = false
    },
    [thunks.put.rejected as any]: (state: TSliceState, action: PayloadErrorAction<T>) => {
      state.status.put.ids[action.meta.arg.id] = false
      state.status.error = action.error
    },

    // DELETE
    [thunks.delete.pending as any]: (state: TSliceState, action: PayloadEntityAction<T>) => {
      state.status.delete.ids[action.meta.arg.id] = true
      state.status.error = null
    },
    [thunks.delete.fulfilled as any]: (state: TSliceState, action: PayloadEntityAction<T>) => {
      state.entities = state.entities.filter(entity => entity.id !== action.meta.arg.id)
      state.status.delete.ids[action.meta.arg.id] = false
    },
    [thunks.delete.rejected as any]: (state: TSliceState, action: PayloadErrorAction<T>) => {
      state.status.delete.ids[action.meta.arg.id] = false
      state.status.error = action.error
    },
  }
}
