const fs = require('fs');

let file = fs.readFileSync('components/features/avatar/avatar-svgs.tsx', 'utf8');

// The gap is around 45 pixels. We will shift the head down by 45 pixels.
const Y_OFFSET = 45;

function shiftPath(d, offset) {
    if (!d || d === 'none') return d;

    return d.replace(/([MCLQZz])([^A-Za-z]*)/g, (match, letter, pointsStr) => {
        if (letter === 'Z' || letter === 'z') return match;

        let trimmed = pointsStr.trim();
        if (!trimmed) return match;

        const points = trimmed.split(/[\s,]+/).map(Number);
        if (points.length === 0 || isNaN(points[0])) return match;

        for (let i = 1; i < points.length; i += 2) {
            points[i] += offset;
        }

        return letter + points.join(',');
    });
}

function processComponent(name, offset) {
    const regex = new RegExp('(export const ' + name + ' = [\\s\\S]*?<svg[^>]*>)([\\s\\S]*?)(<\\/svg>)', 'g');

    file = file.replace(regex, (match, start, inner, end) => {
        let shiftedInner = inner.replace(/d="([^"]+)"/g, (m, dVal) => {
            return 'd="' + shiftPath(dVal, offset) + '"';
        });

        shiftedInner = shiftedInner.replace(/cy="([^"]+)"/g, (m, cyVal) => {
            return 'cy="' + (parseFloat(cyVal) + offset) + '"';
        });

        shiftedInner = shiftedInner.replace(/ y="([^"]+)"/g, (m, yVal) => {
            return ' y="' + (parseFloat(yVal) + offset) + '"';
        });

        return start + shiftedInner + end;
    });
}

// All of these are entirely "Head" elements and should be shifted in their entirety.
const comps = [
    'EyesNormal', 'EyesDetermined', 'EyesTired', 'EyesFeminine', 'EyesSquint', 'EyesWide',
    'MouthNeutral', 'MouthSmirk', 'MouthWorried', 'MouthWideSmile', 'MouthFrown',
    'HairSlickedBack', 'HairBob', 'HairMessy', 'HairBun', 'HairLong', 'HairMilitary', 'HairPonytail',
    'GlassesRound'
];

comps.forEach(c => processComponent(c, Y_OFFSET));

// For BaseSkins, only shift the Head path, the Ear paths, and the Jaw shadows.
// We can do this safely because all Head/Ear/Jaw paths in BaseSkin have coordinates completely above Y=330.
function shiftBaseSkinHeads(name, offset) {
    const regex = new RegExp('(export const ' + name + ' = [\\s\\S]*?<svg[^>]*>)([\\s\\S]*?)(<\\/svg>)', 'g');

    file = file.replace(regex, (match, start, inner, end) => {
        let shiftedInner = inner.replace(/d="([^"]+)"/g, (m, dVal) => {
            if (!dVal || dVal === 'none') return m;

            let newD = dVal.replace(/([MCLQZz])([^A-Za-z]*)/g, (cmdMatch, letter, pointsStr) => {
                if (letter === 'Z' || letter === 'z') return cmdMatch;
                const points = pointsStr.trim().split(/[\s,]+/).map(Number);
                if (points.length === 0 || isNaN(points[0])) return cmdMatch;

                for (let i = 1; i < points.length; i += 2) {
                    // Only shift coordinates that belong to the head (Y < 330)
                    if (points[i] < 330) {
                        points[i] += offset;
                    }
                }
                return letter + points.join(',');
            });
            return 'd="' + newD + '"';
        });

        return start + shiftedInner + end;
    });
}

const baseSkins = ['BaseSkin1', 'BaseSkin2', 'BaseSkin3', 'BaseSkin4'];
baseSkins.forEach(c => shiftBaseSkinHeads(c, Y_OFFSET));

fs.writeFileSync('components/features/avatar/avatar-svgs.tsx', file);
console.log('Successfully shifted SVG Coordinates downward by', Y_OFFSET);
