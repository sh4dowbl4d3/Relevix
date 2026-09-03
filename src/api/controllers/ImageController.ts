import { Request, Response } from 'express';
import { MatchImages } from '../../application/use-cases/MatchImages.js';
import { SuggestionRepository } from '../../domain/repositories/SuggestionRepository.js';
import { ApiResponse, ImageSuggestionResponse } from '../schemas/response.js';
import { GetImagesForPostParams, GetImagesForPostQuery, ApproveSuggestionBody, RejectSuggestionBody } from '../schemas/request.js';

export class ImageController {
  constructor(
    private matchImages: MatchImages,
    private suggestionRepo: SuggestionRepository
  ) {}

  async getImagesForPost(req: Request, res: Response): Promise<void> {
    const paramsResult = GetImagesForPostParams.safeParse(req.params);
    if (!paramsResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: 'Invalid post ID',
          details: paramsResult.error.flatten(),
        },
      });
      return;
    }

    const queryResult = GetImagesForPostQuery.safeParse(req.query);
    if (!queryResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: 'Invalid query parameters',
          details: queryResult.error.flatten(),
        },
      });
      return;
    }

    try {
      const result = await this.matchImages.execute({
        postId: paramsResult.data.id,
        limit: queryResult.data.limit,
        minSimilarity: queryResult.data.minSimilarity,
      });

      const response: ApiResponse<ImageSuggestionResponse> = {
        success: true,
        data: {
          postId: result.postId,
          suggestions: result.suggestions.map(s => ({
            imageId: s.imageId,
            filename: s.filename,
            subject: s.subject,
            category: s.category,
            caption: s.caption,
            similarity: s.similarity,
            confidence: s.confidence,
            guardDecision: {
              accepted: s.guardDecision.accepted,
              reason: s.guardDecision.reason,
              categoryMatch: s.guardDecision.categoryMatch,
            },
          })),
          topSuggestion: result.topSuggestion ? {
            imageId: result.topSuggestion.imageId,
            similarity: result.topSuggestion.similarity,
            confidence: result.topSuggestion.confidence,
            accepted: result.topSuggestion.accepted,
            reason: result.topSuggestion.reason,
          } : null,
          noConfidentMatch: result.noConfidentMatch,
          explanation: result.explanation,
        },
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MATCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to match images',
        },
      });
    }
  }

  async approveSuggestion(req: Request, res: Response): Promise<void> {
    const paramsResult = GetImagesForPostParams.safeParse({ id: req.params.suggestionId });
    if (!paramsResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: 'Invalid suggestion ID',
        },
      });
      return;
    }

    const bodyResult = ApproveSuggestionBody.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BODY',
          message: 'Invalid request body',
          details: bodyResult.error.flatten(),
        },
      });
      return;
    }

    try {
      const suggestion = await this.suggestionRepo.approve(
        req.params.suggestionId,
        'api-user',
        bodyResult.data.notes
      );

      res.json({
        success: true,
        data: suggestion,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'APPROVE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to approve suggestion',
        },
      });
    }
  }

  async rejectSuggestion(req: Request, res: Response): Promise<void> {
    const paramsResult = GetImagesForPostParams.safeParse({ id: req.params.suggestionId });
    if (!paramsResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: 'Invalid suggestion ID',
        },
      });
      return;
    }

    const bodyResult = RejectSuggestionBody.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BODY',
          message: 'Invalid request body',
          details: bodyResult.error.flatten(),
        },
      });
      return;
    }

    try {
      const suggestion = await this.suggestionRepo.reject(
        req.params.suggestionId,
        bodyResult.data.reason,
        'api-user',
        bodyResult.data.notes
      );

      res.json({
        success: true,
        data: suggestion,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'REJECT_FAILED',
          message: error instanceof Error ? error.message : 'Failed to reject suggestion',
        },
      });
    }
  }

  async getSuggestionDetails(req: Request, res: Response): Promise<void> {
    const suggestionId = req.params.suggestionId;

    try {
      const suggestion = await this.suggestionRepo.findById(suggestionId);

      if (!suggestion) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Suggestion not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: suggestion,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch suggestion',
        },
      });
    }
  }
}
