import express from 'express';
import pg from 'pg';
import joi from 'joi';

const app = express();
const port = 3000;
const  { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mahasiswa',
  password: 'R@y310706',
    port: 5432,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        
        console.log({
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
        })
           
     })
        next();
})


function errorResponse(res, message,status, details = null) {
    return res.status(status).json({
        success: false,
        message,
        details,
    });
}

function successResponse(res, message, status, details = null) {
    return res.status(status).json({
        success: false,
        message,
        details: null,
        error: details,
    });
}

const biodataSchema = joi.object({
    id: joi.number().integer().required(),
    nama: joi.string().trim().min(2).max(100).required(),
    nim: joi.string().trim().min(5).max(20).required(),
    kelas: joi.string().trim().min(1).max(10).required(),
})

const idSchema = joi.object({
    id: joi.number().integer().positive().required(),
})
