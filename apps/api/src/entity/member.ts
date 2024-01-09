export class Member {
  readonly id: number;
  readonly name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  static from(name: string) {
    return new Member(null, name);
  }
}
