#[derive(Debug)]
struct Test {
	x: f32,
}

fn main() {
	let t = Test { x: 4. };
	println!("Hello, world! {:?}", t);
}
