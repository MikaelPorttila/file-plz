export class CircleBuffer<T> {
    private index: number = 0;
    private buffer: Array<T>;
    private filled: boolean;

    constructor(private size: number = 10) {
        if (size <= 0) {
            throw new Error("Buffer size must be greater than 0.");
        }

        this.buffer = new Array(this.size);
        this.filled = false;
    }

    add(value: T): void {
        this.buffer[this.index] = value;
        let newIndex = (this.index + 1) % this.size;
        if (newIndex == 0) {
            this.filled = true;
        }
        this.index = newIndex;
    }

    get(): T[] {
        return this.buffer;
    }

    isFilled(): boolean {
        return this.filled;
    }

    reset(): void {
        this.index = 0;
        this.filled = false;
    }
}