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

function validateBody(schema, data) {

    return (req, res, next) => {
        const { error } = schema.validate(req.body,{
            abortEarly: false,
            allowUnknown: false,
            Comment: true,
        });
        if (error) {
            return errorResponse(
                res,
                 'Validasi input gagal',
                  400,
                   error.details.map(item => ({
                    field: item.path.join('.'),
                     message: item.message})));
        }
        req.body = value
        next()
    }
}

function validateParams(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params,)
        if (error) {
            return errorResponse(
                res,
                'paramater tidak valid',
                400,
                error.details.map(item => ({
                    field: item.path.join('.'),
                    message: item.message
                }))
            );
        }
        req.params = value;
        next();
    };
}

app.get('/', async (req, res) => {
    const result = await pool.query('SELECT * FROM biodata ORDER BY id');

    return successresponse(res, 'Data berhasil diambil', 200, result.rows)
})

app.post('/biodata', validateBody(biodataSchema), async (req, res) => {
    const { id, nama, nim, kelas } = req.body;

    const result = await pool.query(
        'INSERT INTO biodata (id, nama, nim, kelas) VALUES ($1, $2, $3, $4) RETURNING *',
        [id, nama, nim, kelas]
    )

    return successresponse(res, 'Data berhasil ditambahkan', 201, result.rows[0])

})
