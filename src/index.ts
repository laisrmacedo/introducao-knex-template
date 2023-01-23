import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { transcode } from 'buffer'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
  console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/bands", async (req: Request, res: Response) => {
    try {
        const result = await db.raw(`SELECT * FROM bands`)
        res.status(200).send(result)
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

//pratica 2
 app.post("/bands", async (req: Request, res: Response) => {
    try {
        const id = req.body.id
        const name = req.body.name

        if(!id || !name){
            res.status(400)
            throw new Error("Dado inválido")
        }
        if(typeof id !== "string" || typeof name !== "string"){
            res.status(400)
            throw new Error("Dado inválido")
        }

        //se tudo der certo, fazer a query
        await db.raw(`
            INSERT INTO bands
            VALUES ("${id}", "${name}")
        `)

        res.status(200).send("Banda cadastrada com sucesso")

        
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
 })

 app.put("/bands/:id", async (req:Request, res: Response) => {
    try {
        const id = req.params.id
        const newId = req.body.id
        const newName = req.body.name

        if(newId !== undefined){
            if(typeof newId !== "string"){
                res.status(400)
                throw new Error("id deve ser string")
            }
            if(newId.length < 2){
                res.status(400)
                throw new Error("Id deve ter no minimo 2 caracteres")
            }
        }


        if(newName !== undefined){
            if(typeof newName !== "string"){
                res.status(400)
                throw new Error("id deve ser string")
            }
            if(newName.length < 3){
                res.status(400)
                throw new Error("Name deve ter no minimo 3 caracteres")
            }
        }

        //verificar se a banda existe
        const [band] = await db.raw(`
            SELECT * FROM bands
            WHERE id = "${id}"
        `)

        //Edição do banco de dados
        if(band){
            await db.raw(`
            UPDATE bands 
            SET 
                id = "${newId || band.id}",
                name = "${newName || band.name}"
            WHERE id = "${id}";
            `)
        }

        res.status(200).send("Dados editados com sucesso")


    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
 })
