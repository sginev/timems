import { UserRole } from "shared/interfaces/UserRole";

const common = {
  randomDay : '{{random.number({"min":18280,"max":18380})}}',
  randomDuration : '{{random.number({"min":1,"max":7})}}',
};

const configuration = {
  users : [
    {
      username: `admin`,
      password: `toptal`,
      role: UserRole.Admin,
      entries: [
        {
          day: common.randomDay,
          duration: common.randomDuration,
          notes: "{{company.catchPhrase}}",
          repeat: '234'
        }
      ],
      repeat: '1'
    },
    {
      username: `manager`,
      password: `toptal`,
      role: UserRole.UserManager,
      entries: [
        {
          day: common.randomDay,
          duration: common.randomDuration,
          notes: "{{lorem.sentence}}.",
          repeat: '17'
        }
      ],
      repeat: '1'
    },
    {
      username: `joe_schmoe`,
      password: `toptal`,
      role: UserRole.Member,
      entries: [
        {
          day: common.randomDay,
          duration: common.randomDuration,
          notes: "{{hacker.phrase}}",
          repeat: '31'
        }
      ],
      repeat: '1'
    },
    {
      username: `{{commerce.color}}_{{internet.domainWord}}`,
      password: `toptal`,
      role: UserRole.UserManager,
      entries: [
        {
          day: common.randomDay,
          duration: common.randomDuration,
          notes: "{{lorem.sentence}}.",
          repeat: '{{random.number({"min":1,"max":24})}}'
        }
      ],
      repeat: '10'
    },
    {
      username: `{{internet.userName}}`,
      password: `toptal`,
      role: UserRole.Member,
      entries: [
        {
          day: common.randomDay,
          duration: common.randomDuration,
          notes: "{{hacker.phrase}}",
          repeat: '{{random.number({"min":1,"max":100})}}'
        }
      ],
      repeat: '77'
    }
  ],
};

export default configuration;