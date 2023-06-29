class GenerateDocumentationSourceNeural {
    static generateSubprogramDocumentation(name) {
        return [
            `The subprogram is called "${name}"`,
            `This is a branch that is a complete branch from the main program.`,
            `When this branching begins its work, at the entrance it receives everything from the main program,`,
            `and ending with the fact that it gives everything away and everything is updated in the main program.`
        ];
    }


    static generateEnviromentDocumentation(name) {
        return [
            `The enviroment is called "${name}"`,
            `It's an environment, it just doesn't depend on anything.`,
            `When this branch starts its work, it receives nothing from`,
            `the main program at the input, and at the end of its work it gives nothing away.`,
            `It's like another universe in which everything is different.`
        ];
    }


    static generateLabelDocumentation(name) {
        return [
            `The label is called "${name}"`,
            ``,
            `When this branch starts its work, at the input it receives`,
            `everything from the main program, and ending with the fact that it updates only registers at the end of its work.`
        ];
    }


    static generateUnitDocumentation(source, argumentsCount, unitName, isReturn, typeReturnValue) {
        let answer = [];

        let start = [
            `The '${unitName}' function has ${argumentsCount} argments, ${isReturn && 'returns something'}`,
            `${typeReturnValue && `This function returns a value of type ${typeReturnValue}`}`
        ];

        answer += start;

        return answer;
    }
}

let source = '@unit draw_pixel(x: Int, s: Int)';

GenerateDocumentationSourceNeural.generateUnitDocumentation(source, 4, 'draw_pixel');
module.exports = GenerateDocumentationSourceNeural;