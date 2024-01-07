const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const Cron = require('cron')

const AutoDeleteLicenses = new Cron.CronJob("0 */1 * * *", async () => {
  console.log("Removing old licenses")
  await prisma.license.deleteMany({
    where: {
      expire: {
        lt: new Date()
      },
      lifetime: {
        equals: false
      }
    }
  })
})

const AutoLogUpdate = new Cron.CronJob("*/10 * * * *", async () => {
  console.log("Updating Logs")

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
      }).catch(err => {
        console.error(err)
      })

      if(!Log) {
        await prisma.log.create({
          data: {
            projectId: Id
          }
        }).catch(err => {
          console.error(err)
        })
      }
    })
  }).catch(err => {
    console.error(err)
  })
}, null)

AutoLogUpdate.start()
AutoDeleteLicenses.start()