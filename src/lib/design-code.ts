import { DETAILS, HANDLES, MODELS, YARNS } from '../data/configurator';
import type { BagSelection } from '../data/types';
import { getDetail, getHandle, getModel, getYarn, reconcileSelection } from './catalog';

/**
 * Design code — deterministic, human-readable, reversible.
 *
 *   BLM - HPK - WOD - KNT
 *   model  ip   detay  sap
 *
 * Derived purely from the selection, so the same bag produces the same code on
 * the server, in the browser and in a DM.
 */
export function buildDesignCode(selection: BagSelection): string {
  return [
    getModel(selection.model).code,
    getYarn(selection.body).code,
    getDetail(selection.detail).code,
    getHandle(selection.handle).code,
  ].join('-');
}

/** Inverse of `buildDesignCode`. Returns null when the code is malformed. */
export function decodeDesignCode(code: string): BagSelection | null {
  const parts = code.trim().toUpperCase().split('-');
  if (parts.length !== 4) return null;

  const model = MODELS.find((m) => m.code === parts[0]);
  const body = YARNS.find((y) => y.code === parts[1]);
  const detail = DETAILS.find((d) => d.code === parts[2]);
  const handle = HANDLES.find((h) => h.code === parts[3]);
  if (!model || !body || !detail || !handle) return null;

  return reconcileSelection({
    model: model.id,
    body: body.id,
    detail: detail.id,
    handle: handle.id,
  });
}
