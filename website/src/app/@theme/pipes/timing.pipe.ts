import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "timing" })
export class TimingPipe implements PipeTransform {
    transform(time: number): string {
        if (time) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${TimingPipe.initZero(minutes)}${minutes}:${TimingPipe.initZero(seconds)}${seconds}`;
        }

        return "00:00";
    }

    private static initZero(time: number): string {
        return time < 10 ? "0" : "";
    }
}
