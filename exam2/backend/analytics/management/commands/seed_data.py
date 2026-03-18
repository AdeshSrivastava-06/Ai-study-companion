"""Seed realistic MCQ question bank + demo data."""
import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from analytics.models import Topic, Question, Test, QuestionAttempt
from datetime import timedelta
from django.utils import timezone

User = get_user_model()

#  Real MCQ Question Bank

QUESTIONS = {
    # PHYSICS 
    'Mechanics': [
        {'text': 'A ball is thrown vertically upward with velocity 20 m/s. What is the maximum height reached? (g = 10 m/s²)',
         'a': '10 m', 'b': '20 m', 'c': '30 m', 'd': '40 m', 'ans': 'B',
         'exp': 'Using v² = u² - 2gh, h = u²/2g = 400/20 = 20 m', 'diff': 'easy'},
        {'text': 'A block of mass 5 kg is placed on a frictionless inclined plane of angle 30°. What is the acceleration of the block?',
         'a': '2.5 m/s²', 'b': '5 m/s²', 'c': '7.5 m/s²', 'd': '10 m/s²', 'ans': 'B',
         'exp': 'a = g sin30° = 10 × 0.5 = 5 m/s²', 'diff': 'easy'},
        {'text': 'Two bodies of masses 3 kg and 5 kg are connected by a light string over a frictionless pulley. What is the acceleration?',
         'a': '1.25 m/s²', 'b': '2.5 m/s²', 'c': '3.75 m/s²', 'd': '5 m/s²', 'ans': 'B',
         'exp': 'a = (m₂-m₁)g/(m₁+m₂) = (5-3)×10/8 = 2.5 m/s²', 'diff': 'medium'},
        {'text': 'A projectile is launched at 60° with horizontal at 40 m/s. What is the range? (g = 10 m/s²)',
         'a': '80√3 m', 'b': '160 m', 'c': '80 m', 'd': '40√3 m', 'ans': 'A',
         'exp': 'R = u²sin2θ/g = 1600×sin120°/10 = 160×(√3/2) = 80√3 m', 'diff': 'medium'},
        {'text': 'A disc and a ring of same mass and radius roll down an incline. Which reaches first?',
         'a': 'Ring', 'b': 'Disc', 'c': 'Both reach together', 'd': 'Depends on angle', 'ans': 'B',
         'exp': 'Disc has lower moment of inertia, so higher acceleration down the incline.', 'diff': 'medium'},
        {'text': 'What is the escape velocity from Earth\'s surface? (R=6400 km, g=10 m/s²)',
         'a': '8 km/s', 'b': '11.2 km/s', 'c': '7.9 km/s', 'd': '15 km/s', 'ans': 'B',
         'exp': 'vₑ = √(2gR) = √(2×10×6.4×10⁶) ≈ 11.2 km/s', 'diff': 'easy'},
        {'text': 'A car moves in a circular path of radius 50 m at 36 km/h. What is the centripetal acceleration?',
         'a': '1 m/s²', 'b': '2 m/s²', 'c': '4 m/s²', 'd': '0.5 m/s²', 'ans': 'B',
         'exp': 'v = 36 km/h = 10 m/s. a = v²/r = 100/50 = 2 m/s²', 'diff': 'easy'},
    ],
    'Thermodynamics': [
        {'text': 'An ideal gas at 27°C is heated at constant pressure to double its volume. The final temperature is:',
         'a': '54°C', 'b': '327°C', 'c': '600°C', 'd': '127°C', 'ans': 'B',
         'exp': 'V₁/T₁ = V₂/T₂. T₂ = 2×300 = 600 K = 327°C', 'diff': 'easy'},
        {'text': 'In an adiabatic process for an ideal gas, which quantity remains constant?',
         'a': 'Temperature', 'b': 'Pressure', 'c': 'PVᵞ', 'd': 'Volume', 'ans': 'C',
         'exp': 'For adiabatic process, PVᵞ = constant (Poisson\'s law).', 'diff': 'easy'},
        {'text': 'The efficiency of a Carnot engine working between 500 K and 300 K is:',
         'a': '20%', 'b': '40%', 'c': '60%', 'd': '80%', 'ans': 'B',
         'exp': 'η = 1 - T₂/T₁ = 1 - 300/500 = 0.4 = 40%', 'diff': 'easy'},
        {'text': 'For 1 mole of a monatomic ideal gas, Cv equals:',
         'a': '3R/2', 'b': '5R/2', 'c': '7R/2', 'd': 'R', 'ans': 'A',
         'exp': 'For monatomic gas, f=3, Cv = fR/2 = 3R/2', 'diff': 'medium'},
        {'text': 'Heat required to raise temperature of 2 kg water by 10°C is: (specific heat = 4200 J/kg°C)',
         'a': '42 kJ', 'b': '84 kJ', 'c': '21 kJ', 'd': '8.4 kJ', 'ans': 'B',
         'exp': 'Q = mcΔT = 2 × 4200 × 10 = 84000 J = 84 kJ', 'diff': 'easy'},
        {'text': 'Which law of thermodynamics defines entropy?',
         'a': 'Zeroth law', 'b': 'First law', 'c': 'Second law', 'd': 'Third law', 'ans': 'C',
         'exp': 'The second law introduces the concept of entropy.', 'diff': 'easy'},
    ],
    'Electrostatics': [
        {'text': 'Two charges of +3 μC and -3 μC are placed 30 cm apart. What is the force between them?',
         'a': '0.9 N', 'b': '0.3 N', 'c': '2.7 N', 'd': '9 N', 'ans': 'A',
         'exp': 'F = kq₁q₂/r² = 9×10⁹ × 9×10⁻¹² / 0.09 = 0.9 N', 'diff': 'easy'},
        {'text': 'The electric field at a distance r from an infinite line charge of linear density λ is:',
         'a': 'λ/2πε₀r', 'b': 'λ/4πε₀r²', 'c': 'λ/ε₀r', 'd': '2λ/πε₀r', 'ans': 'A',
         'exp': 'By Gauss\'s law for infinite line charge, E = λ/(2πε₀r)', 'diff': 'medium'},
        {'text': 'A parallel plate capacitor has plate area A and separation d. If a dielectric of constant K fills it, the capacitance is:',
         'a': 'ε₀A/d', 'b': 'Kε₀A/d', 'c': 'ε₀A/Kd', 'd': 'K²ε₀A/d', 'ans': 'B',
         'exp': 'C = Kε₀A/d. Dielectric increases capacitance by factor K.', 'diff': 'easy'},
        {'text': 'The potential at the centre of a uniformly charged spherical shell of radius R and charge Q is:',
         'a': '0', 'b': 'kQ/R', 'c': 'kQ/2R', 'd': 'kQ/R²', 'ans': 'B',
         'exp': 'Inside a charged shell, potential is constant and equals kQ/R.', 'diff': 'medium'},
        {'text': 'If 3 capacitors of 6μF each are connected in series, the equivalent capacitance is:',
         'a': '18 μF', 'b': '6 μF', 'c': '2 μF', 'd': '3 μF', 'ans': 'C',
         'exp': '1/C = 1/6 + 1/6 + 1/6 = 3/6 = 1/2. C = 2 μF', 'diff': 'easy'},
        {'text': 'Work done in moving a charge of 5 μC through a potential difference of 100 V is:',
         'a': '0.5 mJ', 'b': '5 mJ', 'c': '50 mJ', 'd': '500 mJ', 'ans': 'A',
         'exp': 'W = qV = 5×10⁻⁶ × 100 = 5×10⁻⁴ J = 0.5 mJ', 'diff': 'easy'},
    ],
    'Optics': [
        {'text': 'The focal length of a concave mirror is 15 cm. An object at 30 cm forms an image at:',
         'a': '30 cm', 'b': '15 cm', 'c': '10 cm', 'd': '60 cm', 'ans': 'A',
         'exp': '1/v + 1/u = 1/f → 1/v = 1/(-15) - 1/(-30) = -1/30. v = -30 cm (real)', 'diff': 'easy'},
        {'text': 'Total internal reflection occurs when light travels from:',
         'a': 'Rarer to denser medium', 'b': 'Denser to rarer medium', 'c': 'Any medium to vacuum', 'd': 'Vacuum to any medium', 'ans': 'B',
         'exp': 'TIR requires light moving from denser to rarer medium at angle > critical angle.', 'diff': 'easy'},
        {'text': 'In Young\'s double slit experiment, if slit separation is halved, fringe width:',
         'a': 'Halves', 'b': 'Doubles', 'c': 'Remains same', 'd': 'Quadruples', 'ans': 'B',
         'exp': 'β = λD/d. If d is halved, β doubles.', 'diff': 'medium'},
        {'text': 'A convex lens of focal length 20 cm is combined with a concave lens of focal length 40 cm. The equivalent focal length is:',
         'a': '20 cm', 'b': '40 cm', 'c': '60 cm', 'd': '13.3 cm', 'ans': 'B',
         'exp': '1/f = 1/20 + 1/(-40) = 1/40. f = 40 cm', 'diff': 'medium'},
        {'text': 'Which phenomenon proves the wave nature of light?',
         'a': 'Photoelectric effect', 'b': 'Compton effect', 'c': 'Diffraction', 'd': 'Pair production', 'ans': 'C',
         'exp': 'Diffraction is a wave phenomenon that cannot be explained by particle theory.', 'diff': 'easy'},
        {'text': 'The refractive index of a medium where speed of light is 2×10⁸ m/s is:',
         'a': '1.2', 'b': '1.5', 'c': '2.0', 'd': '0.67', 'ans': 'B',
         'exp': 'n = c/v = 3×10⁸/2×10⁸ = 1.5', 'diff': 'easy'},
    ],
    'Modern Physics': [
        {'text': 'The de Broglie wavelength of an electron accelerated through 100 V is approximately:',
         'a': '0.123 nm', 'b': '1.23 nm', 'c': '12.3 nm', 'd': '0.0123 nm', 'ans': 'A',
         'exp': 'λ = 1.226/√V nm = 1.226/10 ≈ 0.123 nm', 'diff': 'medium'},
        {'text': 'The work function of a metal is 4.2 eV. The threshold frequency is: (h = 4.14×10⁻¹⁵ eV·s)',
         'a': '10¹⁴ Hz', 'b': '10¹⁵ Hz', 'c': '10¹³ Hz', 'd': '10¹⁶ Hz', 'ans': 'B',
         'exp': 'ν₀ = φ/h = 4.2/(4.14×10⁻¹⁵) ≈ 10¹⁵ Hz', 'diff': 'medium'},
        {'text': 'Half-life of a radioactive substance is 5 years. What fraction remains after 15 years?',
         'a': '1/2', 'b': '1/4', 'c': '1/8', 'd': '1/16', 'ans': 'C',
         'exp': 'After n half-lives: N/N₀ = (1/2)ⁿ. n=15/5=3. Fraction = 1/8', 'diff': 'easy'},
        {'text': 'In the Bohr model, the radius of the nth orbit is proportional to:',
         'a': 'n', 'b': 'n²', 'c': '1/n', 'd': '1/n²', 'ans': 'B',
         'exp': 'rₙ = a₀n²/Z. Radius is proportional to n².', 'diff': 'easy'},
        {'text': 'The binding energy per nucleon is maximum for:',
         'a': 'Hydrogen', 'b': 'Uranium', 'c': 'Iron', 'd': 'Helium', 'ans': 'C',
         'exp': 'Iron-56 has the highest binding energy per nucleon (~8.8 MeV).', 'diff': 'medium'},
        {'text': 'Which radiation has the highest penetrating power?',
         'a': 'Alpha', 'b': 'Beta', 'c': 'Gamma', 'd': 'All equal', 'ans': 'C',
         'exp': 'Gamma rays are EM waves with highest energy and penetrating power.', 'diff': 'easy'},
    ],

    # ── CHEMISTRY ─────────────────────────────────────────────────
    'Atomic Structure': [
        {'text': 'The maximum number of electrons in a shell with principal quantum number n=3 is:',
         'a': '8', 'b': '18', 'c': '32', 'd': '2', 'ans': 'B',
         'exp': 'Max electrons = 2n² = 2(9) = 18', 'diff': 'easy'},
        {'text': 'Which quantum number determines the shape of an orbital?',
         'a': 'n', 'b': 'l', 'c': 'ml', 'd': 'ms', 'ans': 'B',
         'exp': 'Azimuthal quantum number l determines the shape (s, p, d, f).', 'diff': 'easy'},
        {'text': 'The wavelength of the first line of the Balmer series of hydrogen is:',
         'a': '656 nm', 'b': '486 nm', 'c': '434 nm', 'd': '121 nm', 'ans': 'A',
         'exp': 'First Balmer line (n=3→n=2) gives Hα at 656 nm.', 'diff': 'medium'},
        {'text': 'According to Heisenberg\'s uncertainty principle, if Δx → 0, then:',
         'a': 'Δp → 0', 'b': 'Δp → ∞', 'c': 'Δp is unchanged', 'd': 'ΔE → 0', 'ans': 'B',
         'exp': 'ΔxΔp ≥ ℏ/2. As Δx decreases, Δp must increase.', 'diff': 'medium'},
        {'text': 'An element has the electronic configuration [Ne] 3s² 3p³. It belongs to:',
         'a': 'Group 13, Period 3', 'b': 'Group 15, Period 3', 'c': 'Group 13, Period 2', 'd': 'Group 5, Period 3', 'ans': 'B',
         'exp': 'Total electrons = 15 (Phosphorus), Group 15, Period 3.', 'diff': 'easy'},
        {'text': 'The number of radial nodes in a 3p orbital is:',
         'a': '0', 'b': '1', 'c': '2', 'd': '3', 'ans': 'B',
         'exp': 'Radial nodes = n - l - 1 = 3 - 1 - 1 = 1', 'diff': 'medium'},
    ],
    'Chemical Bonding': [
        {'text': 'The bond angle in methane (CH₄) is:',
         'a': '90°', 'b': '104.5°', 'c': '109.5°', 'd': '120°', 'ans': 'C',
         'exp': 'Methane has tetrahedral geometry, bond angle = 109.5°', 'diff': 'easy'},
        {'text': 'Which molecule has the highest dipole moment?',
         'a': 'CO₂', 'b': 'BF₃', 'c': 'NH₃', 'd': 'CCl₄', 'ans': 'C',
         'exp': 'NH₃ has a lone pair creating net dipole; CO₂, BF₃, CCl₄ are symmetric.', 'diff': 'medium'},
        {'text': 'The hybridization of carbon in ethylene (C₂H₄) is:',
         'a': 'sp', 'b': 'sp²', 'c': 'sp³', 'd': 'sp³d', 'ans': 'B',
         'exp': 'In C₂H₄, carbon forms a double bond (1σ + 1π), requiring sp² hybridization.', 'diff': 'easy'},
        {'text': 'Hydrogen bonding is strongest in:',
         'a': 'HCl', 'b': 'HBr', 'c': 'HF', 'd': 'HI', 'ans': 'C',
         'exp': 'Fluorine is most electronegative and smallest, forming strongest H-bonds.', 'diff': 'easy'},
        {'text': 'How many sigma and pi bonds are in acetylene (C₂H₂)?',
         'a': '3σ, 2π', 'b': '2σ, 3π', 'c': '5σ, 0π', 'd': '2σ, 2π', 'ans': 'A',
         'exp': 'C₂H₂: 2 C-H σ bonds + 1 C-C σ bond + 2 C-C π bonds = 3σ + 2π', 'diff': 'medium'},
        {'text': 'The geometry of SF₆ is:',
         'a': 'Tetrahedral', 'b': 'Square planar', 'c': 'Octahedral', 'd': 'Trigonal bipyramidal', 'ans': 'C',
         'exp': 'SF₆ has sp³d² hybridization giving octahedral geometry.', 'diff': 'easy'},
    ],
    'Chemical Equilibrium': [
        {'text': 'For the reaction N₂ + 3H₂ ⇌ 2NH₃, what happens if pressure is increased?',
         'a': 'Shifts left', 'b': 'Shifts right', 'c': 'No change', 'd': 'Reaction stops', 'ans': 'B',
         'exp': 'Higher pressure favors fewer moles of gas (4→2), shifting right.', 'diff': 'easy'},
        {'text': 'The pH of 0.01 M HCl solution is:',
         'a': '1', 'b': '2', 'c': '3', 'd': '0.01', 'ans': 'B',
         'exp': 'pH = -log[H⁺] = -log(0.01) = 2', 'diff': 'easy'},
        {'text': 'Le Chatelier\'s principle states that when a system at equilibrium is disturbed, it:',
         'a': 'Reaches a new equilibrium', 'b': 'Shifts to oppose the change', 'c': 'Stops reacting', 'd': 'Both A and B', 'ans': 'D',
         'exp': 'The system shifts to oppose the disturbance and reaches a new equilibrium.', 'diff': 'easy'},
        {'text': 'For Kp = Kc(RT)^Δn, if Δn = 0, then:',
         'a': 'Kp > Kc', 'b': 'Kp < Kc', 'c': 'Kp = Kc', 'd': 'Cannot determine', 'ans': 'C',
         'exp': 'When Δn=0, (RT)⁰=1, so Kp = Kc', 'diff': 'medium'},
        {'text': 'A buffer solution of pH 5 can be prepared by mixing:',
         'a': 'Strong acid + strong base', 'b': 'Weak acid + its salt', 'c': 'Strong acid + weak base', 'd': 'Two strong acids', 'ans': 'B',
         'exp': 'Acidic buffer = weak acid + salt of its conjugate base (e.g., CH₃COOH + CH₃COONa)', 'diff': 'medium'},
        {'text': 'The ionic product of water at 25°C is:',
         'a': '10⁻⁷', 'b': '10⁻¹⁴', 'c': '10⁻¹⁰', 'd': '7', 'ans': 'B',
         'exp': 'Kw = [H⁺][OH⁻] = 10⁻¹⁴ at 25°C', 'diff': 'easy'},
    ],
    'Organic Chemistry': [
        {'text': 'The IUPAC name of CH₃CH₂CH(CH₃)CH₂OH is:',
         'a': '2-Methylbutan-1-ol', 'b': '3-Methylbutan-1-ol', 'c': '2-Methylpentan-1-ol', 'd': 'Isopentanol', 'ans': 'B',
         'exp': 'Longest chain: 4C (butanol); methyl at C3; -OH at C1 → 3-methylbutan-1-ol', 'diff': 'medium'},
        {'text': 'Which reagent is used for the Grignard reaction?',
         'a': 'NaBH₄', 'b': 'LiAlH₄', 'c': 'RMgX in ether', 'd': 'KMnO₄', 'ans': 'C',
         'exp': 'Grignard reagent = RMgX (alkyl/aryl magnesium halide) in dry ether.', 'diff': 'easy'},
        {'text': 'Markovnikov\'s rule applies to the addition of HBr to:',
         'a': 'Ethene', 'b': 'Propene', 'c': 'Ethyne', 'd': 'Methane', 'ans': 'B',
         'exp': 'Markovnikov applies to unsymmetrical alkenes like propene.', 'diff': 'easy'},
        {'text': 'The number of isomers of C₄H₁₀ is:',
         'a': '1', 'b': '2', 'c': '3', 'd': '4', 'ans': 'B',
         'exp': 'C₄H₁₀ has 2 isomers: n-butane and isobutane (2-methylpropane).', 'diff': 'easy'},
        {'text': 'Which compound shows optical isomerism?',
         'a': 'CH₃CHClBr (if chiral C)', 'b': 'CH₃CH₂OH', 'c': 'CH₄', 'd': 'CH₂Cl₂', 'ans': 'A',
         'exp': 'A carbon with 4 different groups (chiral center) shows optical isomerism.', 'diff': 'medium'},
        {'text': 'Benzene undergoes which type of reaction predominantly?',
         'a': 'Addition', 'b': 'Substitution', 'c': 'Elimination', 'd': 'Rearrangement', 'ans': 'B',
         'exp': 'Benzene undergoes electrophilic substitution to preserve aromaticity.', 'diff': 'easy'},
    ],
    'Electrochemistry': [
        {'text': 'The standard electrode potential of hydrogen electrode is:',
         'a': '1.0 V', 'b': '0.0 V', 'c': '-0.76 V', 'd': '0.34 V', 'ans': 'B',
         'exp': 'By convention, standard hydrogen electrode (SHE) potential = 0 V.', 'diff': 'easy'},
        {'text': 'In electrolysis of water, the volume ratio of H₂:O₂ produced is:',
         'a': '1:1', 'b': '1:2', 'c': '2:1', 'd': '3:1', 'ans': 'C',
         'exp': '2H₂O → 2H₂ + O₂. Ratio of H₂:O₂ = 2:1', 'diff': 'easy'},
        {'text': 'Faraday\'s first law of electrolysis states that mass deposited is proportional to:',
         'a': 'Voltage', 'b': 'Quantity of charge', 'c': 'Resistance', 'd': 'Temperature', 'ans': 'B',
         'exp': 'm = ZIt. Mass is directly proportional to charge passed (Q = It).', 'diff': 'easy'},
        {'text': 'Which is the strongest oxidizing agent? (Given: E° values)',
         'a': 'Li⁺/Li (-3.04V)', 'b': 'Na⁺/Na (-2.71V)', 'c': 'F₂/F⁻ (+2.87V)', 'd': 'Cl₂/Cl⁻ (+1.36V)', 'ans': 'C',
         'exp': 'Higher reduction potential → stronger oxidizing agent. F₂ has highest E°.', 'diff': 'medium'},
        {'text': 'The EMF of a Daniell cell is approximately:',
         'a': '0.34 V', 'b': '0.76 V', 'c': '1.1 V', 'd': '2.2 V', 'ans': 'C',
         'exp': 'E°cell = E°cathode - E°anode = 0.34-(-0.76) = 1.10 V', 'diff': 'medium'},
        {'text': 'Conductivity of a solution increases with:',
         'a': 'Decrease in temperature', 'b': 'Increase in dilution', 'c': 'Decrease in ion concentration', 'd': 'Addition of more solvent only', 'ans': 'B',
         'exp': 'Molar conductivity increases with dilution as ion mobility increases.', 'diff': 'easy'},
    ],

    # ── MATHEMATICS ───────────────────────────────────────────────
    'Calculus': [
        {'text': 'The derivative of sin²x is:',
         'a': '2sinx', 'b': 'sin2x', 'c': '2cos²x', 'd': 'cos2x', 'ans': 'B',
         'exp': 'd/dx(sin²x) = 2sinx·cosx = sin2x', 'diff': 'easy'},
        {'text': '∫₀^π sinx dx equals:',
         'a': '0', 'b': '1', 'c': '2', 'd': 'π', 'ans': 'C',
         'exp': '[-cosx]₀^π = -cosπ + cos0 = 1 + 1 = 2', 'diff': 'easy'},
        {'text': 'The value of lim(x→0) sinx/x is:',
         'a': '0', 'b': '1', 'c': '∞', 'd': '-1', 'ans': 'B',
         'exp': 'This is a standard limit: lim(x→0) sinx/x = 1', 'diff': 'easy'},
        {'text': 'If f(x) = eˣ + e⁻ˣ, then f\'(0) equals:',
         'a': '0', 'b': '1', 'c': '2', 'd': '-1', 'ans': 'A',
         'exp': 'f\'(x) = eˣ - e⁻ˣ. f\'(0) = 1 - 1 = 0', 'diff': 'easy'},
        {'text': 'The area under the curve y = x² from x=0 to x=3 is:',
         'a': '3', 'b': '6', 'c': '9', 'd': '27', 'ans': 'C',
         'exp': '∫₀³ x² dx = [x³/3]₀³ = 27/3 = 9', 'diff': 'medium'},
        {'text': 'If y = ln(x²+1), then dy/dx at x=1 is:',
         'a': '1', 'b': '2', 'c': '1/2', 'd': '0', 'ans': 'A',
         'exp': 'dy/dx = 2x/(x²+1). At x=1: 2/(1+1) = 1', 'diff': 'medium'},
    ],
    'Algebra': [
        {'text': 'The sum of roots of x² - 5x + 6 = 0 is:',
         'a': '5', 'b': '6', 'c': '-5', 'd': '-6', 'ans': 'A',
         'exp': 'By Vieta\'s formulas, sum = -b/a = 5/1 = 5', 'diff': 'easy'},
        {'text': 'If A is a 3×3 matrix with |A| = 5, then |2A| equals:',
         'a': '10', 'b': '20', 'c': '40', 'd': '80', 'ans': 'C',
         'exp': '|kA| = k³|A| for 3×3 matrix. |2A| = 8×5 = 40', 'diff': 'medium'},
        {'text': 'The number of terms in the expansion of (a+b)¹⁰ is:',
         'a': '10', 'b': '11', 'c': '12', 'd': '9', 'ans': 'B',
         'exp': 'Number of terms in (a+b)ⁿ = n+1 = 11', 'diff': 'easy'},
        {'text': 'If ⁿC₂ = 45, then n equals:',
         'a': '8', 'b': '9', 'c': '10', 'd': '12', 'ans': 'C',
         'exp': 'n(n-1)/2 = 45 → n²-n-90=0 → n=10', 'diff': 'easy'},
        {'text': 'The common ratio of the GP: 2, 6, 18, 54, ... is:',
         'a': '2', 'b': '3', 'c': '4', 'd': '6', 'ans': 'B',
         'exp': 'r = 6/2 = 3', 'diff': 'easy'},
        {'text': 'The value of i⁴ + i⁸ + i¹² is: (where i = √-1)',
         'a': '-1', 'b': '1', 'c': '3', 'd': '-3', 'ans': 'C',
         'exp': 'i⁴ = 1, i⁸ = 1, i¹² = 1. Sum = 3', 'diff': 'easy'},
    ],
    'Coordinate Geometry': [
        {'text': 'The distance between points (3, 4) and (0, 0) is:',
         'a': '3', 'b': '4', 'c': '5', 'd': '7', 'ans': 'C',
         'exp': 'd = √(9+16) = √25 = 5', 'diff': 'easy'},
        {'text': 'The equation of a circle with center (2, 3) and radius 5 is:',
         'a': '(x-2)²+(y-3)²=25', 'b': '(x+2)²+(y+3)²=25', 'c': '(x-2)²+(y-3)²=5', 'd': 'x²+y²=25', 'ans': 'A',
         'exp': 'Standard form: (x-h)²+(y-k)²=r²', 'diff': 'easy'},
        {'text': 'The slope of the line 3x + 4y - 12 = 0 is:',
         'a': '3/4', 'b': '-3/4', 'c': '4/3', 'd': '-4/3', 'ans': 'B',
         'exp': 'y = -3x/4 + 3. Slope = -3/4', 'diff': 'easy'},
        {'text': 'The eccentricity of a parabola is:',
         'a': '0', 'b': '1', 'c': 'Less than 1', 'd': 'Greater than 1', 'ans': 'B',
         'exp': 'Eccentricity: circle=0, ellipse<1, parabola=1, hyperbola>1', 'diff': 'easy'},
        {'text': 'The locus of a point equidistant from (0,0) and (4,0) is:',
         'a': 'x = 2', 'b': 'y = 2', 'c': 'x + y = 2', 'd': 'x = 4', 'ans': 'A',
         'exp': 'Perpendicular bisector of segment from (0,0) to (4,0) is x = 2.', 'diff': 'easy'},
        {'text': 'The angle between lines y = x and y = -x is:',
         'a': '45°', 'b': '60°', 'c': '90°', 'd': '120°', 'ans': 'C',
         'exp': 'Slopes are 1 and -1. m₁×m₂ = -1, so lines are perpendicular (90°).', 'diff': 'easy'},
    ],
    'Probability & Statistics': [
        {'text': 'A die is thrown twice. The probability of getting sum 7 is:',
         'a': '1/6', 'b': '5/36', 'c': '6/36', 'd': '7/36', 'ans': 'C',
         'exp': 'Favorable: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6 outcomes. P = 6/36 = 1/6', 'diff': 'easy'},
        {'text': 'If P(A) = 0.6 and P(B) = 0.4, and A, B are independent, then P(A∩B) is:',
         'a': '0.1', 'b': '0.24', 'c': '1.0', 'd': '0.4', 'ans': 'B',
         'exp': 'For independent events, P(A∩B) = P(A)×P(B) = 0.6×0.4 = 0.24', 'diff': 'easy'},
        {'text': 'The mean of first 10 natural numbers is:',
         'a': '5', 'b': '5.5', 'c': '10', 'd': '55', 'ans': 'B',
         'exp': 'Sum = 10×11/2 = 55. Mean = 55/10 = 5.5', 'diff': 'easy'},
        {'text': 'In a binomial distribution with n=5 and p=0.5, the mean is:',
         'a': '1.5', 'b': '2.0', 'c': '2.5', 'd': '5.0', 'ans': 'C',
         'exp': 'Mean = np = 5×0.5 = 2.5', 'diff': 'easy'},
        {'text': 'A card is drawn from a standard deck. P(King or Heart) is:',
         'a': '4/13', 'b': '16/52', 'c': '17/52', 'd': '1/4', 'ans': 'A',
         'exp': 'P = P(King)+P(Heart)-P(King∩Heart) = 4/52+13/52-1/52 = 16/52 = 4/13', 'diff': 'medium'},
        {'text': 'Variance of the dataset {2, 4, 4, 4, 5, 5, 7, 9} is:',
         'a': '2', 'b': '4', 'c': '5', 'd': '3.5', 'ans': 'B',
         'exp': 'Mean=5. Variance = Σ(xi-μ)²/n = (9+1+1+1+0+0+4+16)/8 = 32/8 = 4', 'diff': 'medium'},
    ],
    'Trigonometry': [
        {'text': 'The value of sin30° + cos60° is:',
         'a': '0', 'b': '1', 'c': '1/2', 'd': '√3', 'ans': 'B',
         'exp': 'sin30° = 1/2, cos60° = 1/2. Sum = 1', 'diff': 'easy'},
        {'text': 'If tanθ = 3/4, then sinθ equals:',
         'a': '3/5', 'b': '4/5', 'c': '3/4', 'd': '5/3', 'ans': 'A',
         'exp': 'In a 3-4-5 triangle, sinθ = opposite/hypotenuse = 3/5', 'diff': 'easy'},
        {'text': 'The general solution of sinx = 0 is:',
         'a': 'x = nπ', 'b': 'x = (2n+1)π/2', 'c': 'x = 2nπ', 'd': 'x = nπ/2', 'ans': 'A',
         'exp': 'sinx = 0 at x = 0, ±π, ±2π, ... = nπ where n is integer', 'diff': 'easy'},
        {'text': 'cos²x - sin²x equals:',
         'a': '1', 'b': 'cos2x', 'c': 'sin2x', 'd': '-1', 'ans': 'B',
         'exp': 'cos²x - sin²x = cos2x (double angle formula)', 'diff': 'easy'},
        {'text': 'In triangle ABC, if a=5, b=12, C=90°, then c equals:',
         'a': '7', 'b': '13', 'c': '17', 'd': '15', 'ans': 'B',
         'exp': 'By Pythagoras, c = √(25+144) = √169 = 13', 'diff': 'easy'},
        {'text': 'The value of sin⁻¹(1) is:',
         'a': '0', 'b': 'π/4', 'c': 'π/2', 'd': 'π', 'ans': 'C',
         'exp': 'sin(π/2) = 1, so sin⁻¹(1) = π/2', 'diff': 'easy'},
    ],
}


class Command(BaseCommand):
    help = 'Seed question bank and demo data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing old data...')
        QuestionAttempt.objects.all().delete()
        Test.objects.all().delete()
        Question.objects.all().delete()
        Topic.objects.all().delete()

        # Subject mapping
        SUBJECTS = {
            'Mechanics': 'Physics', 'Thermodynamics': 'Physics',
            'Electrostatics': 'Physics', 'Optics': 'Physics', 'Modern Physics': 'Physics',
            'Atomic Structure': 'Chemistry', 'Chemical Bonding': 'Chemistry',
            'Chemical Equilibrium': 'Chemistry', 'Organic Chemistry': 'Chemistry',
            'Electrochemistry': 'Chemistry',
            'Calculus': 'Mathematics', 'Algebra': 'Mathematics',
            'Coordinate Geometry': 'Mathematics', 'Probability & Statistics': 'Mathematics',
            'Trigonometry': 'Mathematics',
        }

        # Create topics and questions
        topic_objs = {}
        total_q = 0
        for topic_name, questions in QUESTIONS.items():
            topic = Topic.objects.create(
                name=topic_name,
                subject=SUBJECTS[topic_name],
                description=f'{topic_name} questions for competitive exams'
            )
            topic_objs[topic_name] = topic

            for q in questions:
                Question.objects.create(
                    topic=topic,
                    text=q['text'],
                    option_a=q['a'],
                    option_b=q['b'],
                    option_c=q['c'],
                    option_d=q['d'],
                    correct_answer=q['ans'],
                    explanation=q['exp'],
                    difficulty=q['diff'],
                    marks=4.0,
                    negative_marks=1.0,
                )
                total_q += 1

        self.stdout.write(f'Created {len(topic_objs)} topics with {total_q} questions')

        # Create demo users
        demo_users = []
        profiles = [
            ('demo', 'Demo', 'Student', 'demo1234', 'JEE', 85, 4),
            ('alice', 'Alice', 'Sharma', 'alice1234', 'JEE', 90, 6),
            ('bob', 'Bob', 'Kumar', 'bob12345', 'GATE', 75, 3),
            ('charlie', 'Charlie', 'Singh', 'charlie1', 'JEE', 80, 5),
            ('diana', 'Diana', 'Patel', 'diana123', 'JEE', 95, 7),
        ]
        for uname, fn, ln, pw, exam, target, hrs in profiles:
            user, created = User.objects.get_or_create(username=uname, defaults={
                'first_name': fn, 'last_name': ln, 'email': f'{uname}@example.com',
                'target_exam': exam, 'target_score': target, 'daily_study_hours': hrs,
            })
            if created:
                user.set_password(pw)
                user.save()
            demo_users.append(user)

        # Create demo tests with attempts for each user
        topic_list = list(topic_objs.values())
        for user in demo_users:
            # Clear existing tests for this user
            Test.objects.filter(user=user).delete()

            # Generate 8 tests over the past month
            for t_idx in range(8):
                test_date = timezone.now() - timedelta(days=28 - t_idx * 4)
                # Pick 20 random questions
                all_qs = list(Question.objects.all().order_by('?')[:20])

                test = Test.objects.create(
                    user=user,
                    title=f'Mock Test {t_idx + 1}',
                    exam_type=user.target_exam,
                    total_questions=len(all_qs),
                    total_marks=len(all_qs) * 4.0,
                    time_limit_minutes=60,
                )
                # Backdate
                Test.objects.filter(pk=test.pk).update(date=test_date)

                score = 0
                time_total = 0
                for q in all_qs:
                    # Simulate varying accuracy based on user
                    base_acc = {'demo': 0.55, 'alice': 0.75, 'bob': 0.50,
                                'charlie': 0.60, 'diana': 0.80}[user.username]
                    # Improve over time
                    acc = min(0.95, base_acc + t_idx * 0.02)

                    is_correct = random.random() < acc
                    skipped = random.random() < 0.08

                    if skipped:
                        st = 'skipped'
                        marks = 0.0
                        answer = ''
                    elif is_correct:
                        st = 'correct'
                        marks = q.marks
                        answer = q.correct_answer
                    else:
                        st = 'incorrect'
                        marks = -q.negative_marks
                        wrong = [c for c in 'ABCD' if c != q.correct_answer]
                        answer = random.choice(wrong)

                    time_s = random.randint(30, 180)
                    score += marks
                    time_total += time_s

                    QuestionAttempt.objects.create(
                        test=test,
                        question=q,
                        topic=q.topic,
                        status=st,
                        is_correct=(st == 'correct'),
                        time_taken_seconds=time_s,
                        difficulty=q.difficulty,
                        marks_obtained=marks,
                        student_answer=answer,
                    )

                Test.objects.filter(pk=test.pk).update(
                    score_obtained=max(0, score),
                    time_taken_minutes=time_total // 60,
                )

        self.stdout.write(self.style.SUCCESS(
            f'✓ Seeded {total_q} questions, {len(demo_users)} users, '
            f'{Test.objects.count()} tests, {QuestionAttempt.objects.count()} attempts'
        ))
