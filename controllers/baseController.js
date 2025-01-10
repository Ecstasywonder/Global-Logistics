const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');

class BaseController {
    constructor(Model) {
        this.Model = Model;
    }

    // Get all records
    getAll = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, sort = '-createdAt', ...filters } = req.query;
        
        // Build query
        let query = this.Model.find(filters);
        
        // Sort
        query = query.sort(sort);
        
        // Pagination
        const startIndex = (page - 1) * limit;
        query = query.skip(startIndex).limit(Number(limit));
        
        // Execute query
        const results = await query;
        const total = await this.Model.countDocuments(filters);
        
        res.status(200).json({
            success: true,
            count: results.length,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            data: results
        });
    });

    // Get single record
    getOne = asyncHandler(async (req, res, next) => {
        const doc = await this.Model.findById(req.params.id);
        
        if (!doc) {
            return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
        }
        
        res.status(200).json({
            success: true,
            data: doc
        });
    });

    // Create record
    create = asyncHandler(async (req, res) => {
        const doc = await this.Model.create(req.body);
        
        res.status(201).json({
            success: true,
            data: doc
        });
    });

    // Update record
    update = asyncHandler(async (req, res, next) => {
        const doc = await this.Model.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        
        if (!doc) {
            return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
        }
        
        res.status(200).json({
            success: true,
            data: doc
        });
    });

    // Delete record
    delete = asyncHandler(async (req, res, next) => {
        const doc = await this.Model.findByIdAndDelete(req.params.id);
        
        if (!doc) {
            return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
        }
        
        res.status(200).json({
            success: true,
            data: {}
        });
    });
}

module.exports = BaseController; 