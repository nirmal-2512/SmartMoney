import * as anomaliesService from './anomalies.service.js';

export const getAllAnomalies = async (req, res, next) => {
  try {
    const anomalies = await anomaliesService.getAllAnomalies(req.user.id);
    res.status(200).json({ anomalies });
  } catch (err) {
    next(err);
  }
};

export const dismissAnomaly = async (req, res, next) => {
  try {
    const result = await anomaliesService.dismissAnomaly(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const recomputeBaselines = async (req, res, next) => {
  try {
    const result = await anomaliesService.recomputeBaselines(req.user.id);
    res.status(200).json({ message: 'Baselines recomputed', count: result.length });
  } catch (err) {
    next(err);
  }
};

export const detectForTransaction = async (req, res, next) => {
  try {
    const anomalies = await anomaliesService.detectAnomalies(req.user.id, req.params.transactionId);
    res.status(200).json({ anomalies });
  } catch (err) {
    next(err);
  }
};