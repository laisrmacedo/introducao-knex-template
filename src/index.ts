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
        // const result = await db.raw(`SELECT * FROM bands`)
        const result = await db("bands")
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

        //se tudo der certo, fazer a query - intro knex
        // await db.raw(`
        //     INSERT INTO bands
        //     VALUES ("${id}", "${name}")
        // `)

        //outra forma de fazer - aula aprof knex
        await db("bands").insert({id, name})

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
        // desestruturado para encontrar o 1 item do array
        // const [band] = await db.raw(` 
        //     SELECT * FROM bands
        //     WHERE id = "${id}"
        // `)

        //outra forma de fazer
        const [band] = await db("bands").where({id})

        //Edição do banco de dados
        if(band){
            // await db.raw(`
            // UPDATE bands 
            // SET 
            //     id = "${newId || band.id}",
            //     name = "${newName || band.name}"
            // WHERE id = "${id}";
            // `)

            //outra forma de fazer
            const updatedBand = {
                id: newId || band.id,
                name: newName || band.name
            }
            await db("bands").update(updatedBand).where({id})
        }else{
            res.status(404)
            throw new Error('Id não encontrada')
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

app.get("/bands/:id", async (req:Request, res: Response) => {
    try {
        const id = req.params.id
        const [band] = await db.raw(`
        SELECT * FROM bands
        WHERE id = "${id}"
        `)
        res.status(200).send(band)
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

app.delete('/bands/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        if(!id) {
            res.status(404)
            throw new Error('Informe um id')
        }
        const [foundBand] = await db("bands").where({id})

        if(foundBand){
            await db("bands").del().where({id})
            res.status(200).send("Banda deletada com sucesso")
        }else{
            res.status(404)
            throw new Error('Banda não encontrada')
        }
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

//========= SONGS ==========

app.get("/songs", async (req: Request, res: Response) => {
    try {
        // const result = await db.raw(`
        //     SELECT * FROM songs;
        // `)
        const result = await db("songs")
        
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

app.post("/songs", async (req: Request, res: Response) => {
    try {
        const id = req.body.id
        const name = req.body.name
        const bandId = req.body.bandId

        if (typeof id !== "string") {
            res.status(400)
            throw new Error("'id' inválido, deve ser string")
        }

        if (typeof name !== "string") {
            res.status(400)
            throw new Error("'name' inválido, deve ser string")
        }

        if (typeof bandId !== "string") {
            res.status(400)
            throw new Error("'bandId' inválido, deve ser string")
        }

        if (id.length < 1 || name.length < 1 || bandId.length < 1) {
            res.status(400)
            throw new Error("'id', 'name' e 'bandId' devem possuir no mínimo 1 caractere")
        }

        // await db.raw(`
        //     INSERT INTO songs (id, name, band_id)
        //     VALUES ("${id}", "${name}", "${bandId}");
        // `)

        await db("songs").insert({id: id, name: name, band_id: bandId})

        res.status(200).send("Música cadastrada com sucesso")
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

app.put("/songs/:id", async (req: Request, res: Response) => {
    try {
        const idToEdit = req.params.id

        const newId = req.body.id
        const newName = req.body.name
        const newBandId = req.body.bandId

        if (newId !== undefined) {

            if (typeof newId !== "string") {
                res.status(400)
                throw new Error("'id' deve ser string")
            }

            if (newId.length < 1) {
                res.status(400)
                throw new Error("'id' deve possuir no mínimo 1 caractere")
            }
        }

        if (newName !== undefined) {

            if (typeof newName !== "string") {
                res.status(400)
                throw new Error("'name' deve ser string")
            }

            if (newName.length < 1) {
                res.status(400)
                throw new Error("'name' deve possuir no mínimo 1 caractere")
            }
        }

        if (newBandId !== undefined) {

            if (typeof newBandId !== "string") {
                res.status(400)
                throw new Error("'name' deve ser string")
            }

            if (newBandId.length < 1) {
                res.status(400)
                throw new Error("'name' deve possuir no mínimo 1 caractere")
            }
        }

        // const [ song ] = await db.raw(`
        //     SELECT * FROM songs
        //     WHERE id = "${idToEdit}";
        // `) // desestruturamos para encontrar o primeiro item do array
        
        const [ song ] = await db("songs").where({id: idToEdit})

        if (song) {
            // await db.raw(`
            //     UPDATE songs
            //     SET
            //         id = "${newId || song.id}",
            //         name = "${newName || song.name}",
            //         band_id = "${newBandId || song.band_id}"
            //     WHERE
            //         id = "${idToEdit}";
            // `)
            const updatedSong = {
                id: newId || song.id,
                name: newName || song.name,
                band_id: newBandId || song.band_id
            }
            await db("songs").update(updatedSong).where({id: idToEdit})

        } else {
            res.status(404)
            throw new Error("'id' não encontrada")
        }

        res.status(200).send({ message: "Atualização realizada com sucesso" })
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

app.delete('/songs/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        if(!id) {
            res.status(404)
            throw new Error('Informe um id')
        }
        const [foundSong] = await db("songs").where({id})

        if(foundSong){
            await db("songs").del().where({id})
            res.status(200).send("Musica deletada com sucesso")
        }else{
            res.status(404)
            throw new Error('Musica não encontrada')
        }
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