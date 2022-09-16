//HTTP methods / API RESTful / HTTP Codes
/**
 * HTTP Codes -> São os status das requisições
 * Os que começam...
 * 2 -> Sucesso
 * 3 -> Redirecionamento
 * 4 -> Erros gerados pela nossa aplicação
 * 5 -> Erros que são inesperados
 */

/**
 * GET ==> Leitura
 * POST ==> Criando algo (entidade, recurso)
 * PUT ==> Editando uma entidade (por completo) (editar um perfil)
 * PATCH ==> Editando uma informação muito especifica (receber notificação ou não)
 * DELETE ==> Removar alguma entidade do back-end
 */

//Tipos de parametros
/**
 * Query: ... utilizados para (Filtros, Ordenação, para informações que não são sensiveis) ex: localhost:3333/ads?page=2
 * Route: ... utilizado para (identificação de um recurso)ex: localhost:3333/ads/5
 * Body: ... Enviar varias informações em uma única requisição (Envio de formulários)
 */
import express from "express";
import cors from "cors";

import { PrismaClient } from "@prisma/client";
import { convertHourStringToMinutes } from "./utils/convert-hour-string-to-minutes";
import { convertMInutesToHourString } from "./utils/convert-minutes-to-hour-string";

const app = express();

app.use(express.json);
const prisma = new PrismaClient();
app.use(cors());

app.get("/games", async (request, response) => {
  console.log("Estou aqui!!");
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });

  return response.json(games);
});

app.post("/games/:id/ads", async (request, response) => {
  const gameId = request.params.id;
  const body: any = request.body;
  //Adicionar validação nesse body utilizando zod javascript

  const ad = await prisma.ad.create({
    data: {
      gameId: gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(","),
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,
      createdAt: body.createdAt,
    },
  });
  return response.status(201).json(ad);
});

app.get("/games/:id/ads", async (request, response) => {
  const gameId = request.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId: gameId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return response.json(
    ads.map((ad) => {
      return {
        ...ad,
        weekDays: ad.weekDays.split(","),
        hourStart: convertMInutesToHourString(ad.hourStart),
        hourEnd: convertMInutesToHourString(ad.hourEnd),
      };
    })
  );
});

app.get("/ads/:id/discord", async (request, response) => {
  const adId = request.params.id;
  console.log("Estou aqui!");
  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    },
  });

  return response.json({
    discord: ad.discord,
  });
});

app.listen(3333);
