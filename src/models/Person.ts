export default class Person {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly popularity: number,
    public readonly poster?: URL,
  ) { }
}
