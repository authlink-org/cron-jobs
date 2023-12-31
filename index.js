const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const Cron = require('cron')


const AutoLogUpdate = new Cron.CronJob("*/10 * * * *", async () => {
  console.log("CRON JOB RUN")

  const Today = new Date();
  Today.setHours(1, 0, 0, 0);

  await prisma.project.findMany({
    where: {
      active: {
        equals: true
      },
    },
    select: {
      id: true
    }
  }).then((DB) => {
    DB.forEach(async (Project) => {
      const Id = Project.id
      const Log = await prisma.log.findFirst({
        where: {
          projectId: Id,
          date: Today
        }
      })

      if(!Log) {
        await prisma.log.create({
          data: {
            projectId: Id
          }
        })
      }
    })
  })

}, null)

AutoLogUpdate.start()