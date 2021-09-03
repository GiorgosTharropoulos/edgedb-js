import {edgedb} from "@generated/imports";
import {$expr_Select} from "@syntax/select";
import {typeutil} from "../../src/reflection";
import e from "../generated/example";
import {setupTests, teardownTests, TestData} from "./setupTeardown";

let pool: edgedb.Pool;
let data: TestData;

beforeAll(async () => {
  const setup = await setupTests();
  pool = setup.pool;
  data = setup.data;
});

afterAll(async () => {
  await teardownTests(pool);
});

test("detached", async () => {
  const heroes = await e.select(e.Hero).query(pool);

  const result = await e
    .select(e.Hero, (hero) => ({
      id: true,
      name: true,
      friends: e.select(e.detached(e.Hero)),
      filter: e.eq(hero.name, e.str("Iron Man")),
    }))
    .query(pool);
  type result = typeof result;
  const f1: typeutil.assertEqual<
    result,
    {
      id: string;
      name: string;
      friends: {id: string}[];
    } | null
  > = true;
  expect(result).toMatchObject({
    id: data.iron_man.id,
    name: data.iron_man.name,
  });
  expect(result?.friends).toEqual(heroes);
});
